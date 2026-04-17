CREATE TABLE IF NOT EXISTS digital_will (
  will_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_will_user_id ON digital_will(user_id);
