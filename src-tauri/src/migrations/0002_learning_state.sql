CREATE TABLE IF NOT EXISTS draft_responses (
  task_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS misconceptions (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unresolved', 'retesting', 'resolved')),
  detected_at TEXT NOT NULL,
  resolved_at TEXT,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_runs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('baseline', 'blind')),
  rubric_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS state_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_misconceptions_status ON misconceptions(status, concept_id);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_created ON assessment_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed ON review_logs(reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_task ON user_responses(task_id);
