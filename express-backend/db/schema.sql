CREATE TABLE IF NOT EXISTS device_info (
  device_id TEXT PRIMARY KEY,
  nickname TEXT,
  public_key TEXT,
  private_key TEXT,
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS local_messages (
  id SERIAL PRIMARY KEY,
  mesh_id TEXT NOT NULL,
  sender_device_id TEXT,
  text TEXT,
  timestamp BIGINT,
  is_synced BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS global_messages (
  id SERIAL PRIMARY KEY,
  mesh_id TEXT NOT NULL,
  sender_device_id TEXT,
  text TEXT,
  timestamp BIGINT,
  version_synced INTEGER
);

CREATE TABLE IF NOT EXISTS version_logs (
  id SERIAL PRIMARY KEY,
  mesh_id TEXT NOT NULL,
  cid TEXT,
  iota_tx_hash TEXT,
  version_number INTEGER,
  timestamp BIGINT
);
