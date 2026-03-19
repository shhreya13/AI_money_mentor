// routes/ai.js  – all AI tool endpoints (streaming SSE)
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { streamAI, callAI, streamChat } from '../services/ai.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Helper: set SSE headers ───────────────────────────────────────────────────
function startSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── Generic streaming tool handler ───────────────────────────────────────────
function makeTool(toolName, saveResult) {
  return [optionalAuth, async (req, res) => {
    startSSE(res);
    const sessionId = uuid();

    streamAI(
      toolName,
      req.body,
      // onChunk
      (chunk) => sseWrite(res, 'chunk', { text: chunk }),
      // onDone
      (fullText) => {
        sseWrite(res, 'done', { sessionId });
        res.end();
        // Persist session
        if (req.user) {
          db.prepare(`INSERT INTO sessions (id,user_id,tool,input_data,result_text) VALUES (?,?,?,?,?)`)
            .run(sessionId, req.user.id, toolName, JSON.stringify(req.body), fullText);
        }
        if (saveResult) saveResult(req, fullText, sessionId);
      },
      // onError
      (err) => {
        console.error(`[${toolName}] AI error:`, err.message);
        sseWrite(res, 'error', { message: err.message });
        res.end();
      }
    );
  }];
}

// ─── POST /ai/fire ─────────────────────────────────────────────────────────────
router.post('/fire', ...makeTool('fire', (req, fullText, sessionId) => {
  if (!req.user) return;
  const fireNum = extractNumber(fullText, /FIRE Number[^\d₹]*[₹]?([\d,]+(?:\.\d+)?(?:\s?(?:Cr|L|K))?)/i);
  db.prepare(`INSERT INTO fire_plans (id,user_id,input_data,plan_text,fire_number,target_age) VALUES (?,?,?,?,?,?)`)
    .run(sessionId, req.user.id, JSON.stringify(req.body), fullText, fireNum, req.body.retireAge);
}));

// ─── POST /ai/life ─────────────────────────────────────────────────────────────
// Auto-enriches with user's saved profile + latest portfolio + FIRE number from DB
router.post('/life', optionalAuth, (req, res) => {
  startSSE(res);
  const sessionId = uuid();

  const enriched = { ...req.body };
  if (req.user) {
    const profile   = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
    const portfolio = db.prepare('SELECT raw_input FROM portfolios WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
    const fireplan  = db.prepare('SELECT fire_number FROM fire_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
    if (profile) {
      if (!enriched.income)              enriched.income              = profile.income;
      if (!enriched.existingInvestments) enriched.existingInvestments = profile.savings;
      if (!enriched.bracket)             enriched.bracket             = profile.tax_bracket;
      if (!enriched.risk)                enriched.risk                = profile.risk;
    }
    if (portfolio?.raw_input)  enriched.portfolioSnapshot = portfolio.raw_input.slice(0, 600);
    if (fireplan?.fire_number) enriched.fireNumber        = fireplan.fire_number;
  }

  streamAI(
    'life', enriched,
    (chunk)    => sseWrite(res, 'chunk', { text: chunk }),
    (fullText) => {
      sseWrite(res, 'done', { sessionId }); res.end();
      if (req.user)
        db.prepare('INSERT INTO sessions (id,user_id,tool,input_data,result_text) VALUES (?,?,?,?,?)')
          .run(sessionId, req.user.id, 'life', JSON.stringify(req.body), fullText);
    },
    (err) => { sseWrite(res, 'error', { message: err.message }); res.end(); }
  );
});

// ─── POST /ai/tax ──────────────────────────────────────────────────────────────
router.post('/tax', ...makeTool('tax'));

// ─── POST /ai/couple ───────────────────────────────────────────────────────────
router.post('/couple', ...makeTool('couple'));

// ─── POST /ai/xray ─────────────────────────────────────────────────────────────
router.post('/xray', ...makeTool('xray', (req, fullText, sessionId) => {
  if (!req.user) return;
  const xirr = extractNumber(fullText, /XIRR[^\d]*?([\d.]+)%/i);
  db.prepare(`INSERT INTO portfolios (id,user_id,raw_input,analysis,xirr) VALUES (?,?,?,?,?)`)
    .run(sessionId, req.user.id, req.body.portfolioText, fullText, xirr);
}));

// ─── POST /ai/score ────────────────────────────────────────────────────────────
// Returns JSON (no streaming needed for score computation)
router.post('/score', optionalAuth, async (req, res) => {
  try {
    const raw = await callAI('score', req.body);
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    if (req.user) {
      const id = uuid();
      db.prepare(`INSERT INTO health_scores 
        (id,user_id,overall,grade,emergency,insurance,investment,debt,tax,retirement,summary,answers)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(
          id, req.user.id, result.score, result.grade,
          result.dims?.emergency?.score, result.dims?.insurance?.score,
          result.dims?.investment?.score, result.dims?.debt?.score,
          result.dims?.tax?.score, result.dims?.retirement?.score,
          result.summary, JSON.stringify(req.body)
        );
    }

    res.json(result);
  } catch (err) {
    console.error('[score] error:', err.message);
    res.status(500).json({ error: 'Failed to compute score' });
  }
});

// ─── POST /ai/chat ─────────────────────────────────────────────────────────────
router.post('/chat', optionalAuth, (req, res) => {
  startSSE(res);
  const { messages } = req.body;
  const profile = req.user
    ? db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id)
    : null;

  streamChat(
    messages,
    profile,
    (chunk) => sseWrite(res, 'chunk', { text: chunk }),
    (fullText) => {
      sseWrite(res, 'done', {});
      res.end();
      if (req.user) {
        db.prepare(`INSERT INTO sessions (id,user_id,tool,input_data,result_text) VALUES (?,?,?,?,?)`)
          .run(uuid(), req.user.id, 'chat', JSON.stringify({ messages }), fullText);
      }
    },
    (err) => {
      sseWrite(res, 'error', { message: err.message });
      res.end();
    }
  );
});

// ─── GET /ai/history ──────────────────────────────────────────────────────────
router.get('/history', requireAuth, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const rows = db.prepare(`SELECT id,tool,created_at,input_data FROM sessions WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(req.user.id, limit, offset);
  const total = db.prepare('SELECT COUNT(*) as n FROM sessions WHERE user_id=?').get(req.user.id);
  res.json({ rows, total: total.n, page });
});

// ─── GET /ai/history/:id ──────────────────────────────────────────────────────
router.get('/history/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM sessions WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// ─── GET /ai/fire-plans ───────────────────────────────────────────────────────
router.get('/fire-plans', requireAuth, (req, res) => {
  const plans = db.prepare('SELECT id,fire_number,target_age,created_at FROM fire_plans WHERE user_id=? ORDER BY created_at DESC LIMIT 5').all(req.user.id);
  res.json(plans);
});

// ─── GET /ai/scores ───────────────────────────────────────────────────────────
router.get('/scores', requireAuth, (req, res) => {
  const scores = db.prepare('SELECT id,overall,grade,summary,created_at FROM health_scores WHERE user_id=? ORDER BY created_at DESC LIMIT 10').all(req.user.id);
  res.json(scores);
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function extractNumber(text, regex) {
  const m = text.match(regex);
  if (!m) return null;
  const s = m[1].replace(/,/g, '');
  if (s.endsWith('Cr')) return parseFloat(s) * 1e7;
  if (s.endsWith('L')) return parseFloat(s) * 1e5;
  if (s.endsWith('K')) return parseFloat(s) * 1e3;
  return parseFloat(s);
}

export default router;
