-- Digital Assets Table Migration
-- Run this SQL to set up the digital_assets table

CREATE TABLE IF NOT EXISTS digital_assets (
  asset_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster user asset queries
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_created_at ON digital_assets(created_at DESC);

-- Example asset data structure (for reference):
-- asset_data = {
--   "username": "user@example.com",
--   "password": "encrypted_password",
--   "url": "https://example.com",
--   "recovery_codes": ["code1", "code2"],
--   "notes": "account details"
-- }
