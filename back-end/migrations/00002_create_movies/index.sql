CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  external_id INTEGER NOT NULL DEFAULT 0,
  title VARCHAR(500) NOT NULL,
  genre VARCHAR(100) NOT NULL DEFAULT 'Unknown',
  release_date DATE,
  overview TEXT NOT NULL DEFAULT '',
  vote_average DECIMAL(4, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS movies_external_id_idx
  ON movies (external_id)
  WHERE external_id != 0;

CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
  records_synced INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);
