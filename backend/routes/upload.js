// routes/upload.js  – PDF / CAMS statement upload
import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are accepted'));
  },
});

// ─── POST /upload/form16 ──────────────────────────────────────────────────────
router.post('/form16', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text.slice(0, 8000); // trim to context limit

    // Extract key fields with regex
    const extracted = {
      raw: text,
      grossSalary: extractField(text, /Gross Salary[\s:₹]*([\d,]+)/i),
      basicSalary: extractField(text, /Basic[\s:₹]*([\d,]+)/i),
      hra: extractField(text, /HRA|House Rent Allowance[\s:₹]*([\d,]+)/i),
      professionalTax: extractField(text, /Professional Tax[\s:₹]*([\d,]+)/i),
      tds: extractField(text, /Tax Deducted|TDS[\s:₹]*([\d,]+)/i),
      pan: extractField(text, /PAN\s*:?\s*([A-Z]{5}[0-9]{4}[A-Z])/i),
      employerName: extractField(text, /Name of Employer[\s:]*([A-Za-z ]+)/i),
    };

    res.json({ success: true, extracted, pageCount: data.numpages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse PDF: ' + err.message });
  }
});

// ─── POST /upload/cams ────────────────────────────────────────────────────────
router.post('/cams', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    // Parse CAMS-style fund lines
    const fundLines = parseCamsText(text);
    res.json({ success: true, portfolioText: fundLines.join('\n'), rawLength: text.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse CAMS PDF: ' + err.message });
  }
});

function extractField(text, regex) {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

function parseCamsText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fundLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // CAMS typically has fund name followed by folio, units, value
    if (/Fund|Scheme/i.test(line) && /\d{4,}/.test(lines[i + 1] || '')) {
      fundLines.push(`${line}: ${lines[i + 1] || ''}`);
    }
  }
  return fundLines.length > 0 ? fundLines : [text.slice(0, 3000)];
}

export default router;
