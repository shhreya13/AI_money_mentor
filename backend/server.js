// server.js – AI Money Mentor API Server
import 'dotenv/config';
// Sanitise env vars — strip any stray quotes or whitespace Windows editors add
if (process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY.trim().replace(/^['"]|['"]$/g, '');
}
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import uploadRouter from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'Too many AI requests, slow down.' } });
app.use(limiter);
app.use('/ai', aiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/ai', aiRouter);
app.use('/upload', uploadRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const key = process.env.GEMINI_API_KEY || '';
  res.json({
    status: 'ok',
    service: 'AI Money Mentor API',
    timestamp: new Date().toISOString(),
    gemini_key_set: key.length > 10,
    gemini_key_preview: key ? key.slice(0, 8) + '...' : 'NOT SET',
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀  AI Money Mentor API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/health\n`);
});
