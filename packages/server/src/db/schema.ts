import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'newbie.db')

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    query_type TEXT NOT NULL CHECK(query_type IN ('artist', 'genre')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    share_code TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_roadmaps_query ON roadmaps(query, query_type);
  CREATE INDEX IF NOT EXISTS idx_roadmaps_share_code ON roadmaps(share_code);

  CREATE TABLE IF NOT EXISTS explainers (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    significance TEXT NOT NULL,
    critic_quotes_json TEXT NOT NULL,
    listen_for_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    completed_step_ids_json TEXT NOT NULL DEFAULT '[]',
    last_accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, roadmap_id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, roadmap_id)
  );
`)

export default db
