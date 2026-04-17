CREATE TABLE IF NOT EXISTS dead_mans_switch (
  dms_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  check_interval_days INTEGER NOT NULL DEFAULT 30,
  last_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dead_mans_switch_user_id ON dead_mans_switch(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_mans_switch_status ON dead_mans_switch(status);
