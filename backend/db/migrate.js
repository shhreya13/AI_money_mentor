// db/migrate.js  – bootstrap SQLite schema using sql.js (pure JS)
import db from './index.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
    age INTEGER, income REAL, expenses REAL, savings REAL, city TEXT, tax_bracket TEXT, risk TEXT DEFAULT 'moderate',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS health_scores (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
    overall INTEGER NOT NULL, grade TEXT NOT NULL,
    emergency INTEGER, insurance INTEGER, investment INTEGER, debt INTEGER, tax INTEGER, retirement INTEGER,
    summary TEXT, answers TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
    tool TEXT NOT NULL, input_data TEXT, result_text TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
    raw_input TEXT NOT NULL, analysis TEXT, xirr REAL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS fire_plans (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
    input_data TEXT NOT NULL, plan_text TEXT, fire_number REAL, target_age INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_scores_user ON health_scores(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_fire_user ON fire_plans(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolios(user_id, created_at);
`);
console.log('✅  Database migrated successfully');
