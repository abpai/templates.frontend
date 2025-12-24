-- Minimal D1 schema for the starter Worker
-- Run with: npx wrangler d1 execute <db-name> --file=migrations/0001_schema.sql

CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
