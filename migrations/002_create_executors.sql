CREATE TABLE IF NOT EXISTS executors (
  executor_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  executor_name VARCHAR(255) NOT NULL,
  executor_email VARCHAR(255) NOT NULL,
  executor_phone VARCHAR(20),
  relationship VARCHAR(100),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  access_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_executors_user_id ON executors(user_id);
CREATE INDEX IF NOT EXISTS idx_executors_created_at ON executors(created_at DESC);
