// routes/auth.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuid();
    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(id, email, hash, name);

    const token = jwt.sign({ sub: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ token, user: { id, email, name } });
  }
);

// ─── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  }
);

// ─── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  const latestScore = db.prepare('SELECT * FROM health_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  const sessionCount = db.prepare('SELECT COUNT(*) as n FROM sessions WHERE user_id = ?').get(req.user.id);
  res.json({ user: req.user, profile, latestScore, sessionCount: sessionCount.n });
});

// ─── PUT /auth/profile ─────────────────────────────────────────────────────────
router.put('/profile', requireAuth, (req, res) => {
  const { age, income, expenses, savings, city, tax_bracket, risk } = req.body;
  const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare(`UPDATE profiles SET age=?,income=?,expenses=?,savings=?,city=?,tax_bracket=?,risk=?,updated_at=strftime('%s','now') WHERE user_id=?`)
      .run(age, income, expenses, savings, city, tax_bracket, risk, req.user.id);
  } else {
    db.prepare(`INSERT INTO profiles (id,user_id,age,income,expenses,savings,city,tax_bracket,risk) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(uuid(), req.user.id, age, income, expenses, savings, city, tax_bracket, risk);
  }
  res.json({ success: true });
});

export default router;
