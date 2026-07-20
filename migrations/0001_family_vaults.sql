CREATE TABLE IF NOT EXISTS family_vaults (
  id TEXT PRIMARY KEY,
  auth_hash TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_vaults_updated_at
  ON family_vaults(updated_at);
