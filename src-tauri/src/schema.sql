PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entities (
  entity_type TEXT NOT NULL,
  id TEXT NOT NULL,
  payload TEXT NOT NULL,
  content_origin TEXT NOT NULL DEFAULT 'user',
  verification_status TEXT NOT NULL DEFAULT 'not_required',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_type, id)
);

CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  pdf_path TEXT,
  doi TEXT,
  pmid TEXT,
  journal TEXT,
  year INTEGER,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_responses (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_text TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 4),
  locked INTEGER NOT NULL DEFAULT 1 CHECK (locked IN (0, 1)),
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_items (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL,
  difficulty REAL NOT NULL,
  stability REAL NOT NULL,
  retrievability REAL NOT NULL,
  due TEXT NOT NULL,
  last_review TEXT,
  lapses INTEGER NOT NULL DEFAULT 0,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_logs (
  id TEXT PRIMARY KEY,
  review_item_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  correctness INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  payload TEXT NOT NULL,
  FOREIGN KEY (review_item_id) REFERENCES review_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_due ON review_items(due);

