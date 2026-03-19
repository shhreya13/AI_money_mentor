// db/index.js  –  sql.js wrapper (pure JS, no native build required)
// Loads the DB from disk on startup, writes back on every mutation.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(process.env.DB_PATH || `${__dirname}/money_mentor.db`);
mkdirSync(dirname(DB_PATH), { recursive: true });

// ── boot sql.js ───────────────────────────────────────────────────────────────
const SQL = await initSqlJs();

let _db;
function getDb() {
  if (_db) return _db;
  _db = existsSync(DB_PATH)
    ? new SQL.Database(readFileSync(DB_PATH))
    : new SQL.Database();
  return _db;
}

function save() {
  writeFileSync(DB_PATH, Buffer.from(getDb().export()));
}

// ── thin wrapper mirroring better-sqlite3's synchronous API ──────────────────
const db = {
  exec(sql) {
    getDb().run(sql);
    save();
  },

  prepare(sql) {
    return {
      /** Returns first matching row as a plain object, or undefined */
      get(...params) {
        const stmt = getDb().prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },
      /** Returns all matching rows */
      all(...params) {
        const stmt = getDb().prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
      /** INSERT / UPDATE / DELETE */
      run(...params) {
        getDb().run(sql, params);
        save();
        return { changes: getDb().getRowsModified() };
      },
    };
  },

  pragma(s) {
    try { getDb().run(`PRAGMA ${s}`); } catch (_) {}
  },
};

export default db;
