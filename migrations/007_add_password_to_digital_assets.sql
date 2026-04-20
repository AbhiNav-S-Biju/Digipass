-- Add password column to digital_assets table
-- This allows storing account passwords securely for executor access

ALTER TABLE digital_assets
ADD COLUMN IF NOT EXISTS account_password VARCHAR(255);

-- Create index on the password column for faster lookups (if needed)
CREATE INDEX IF NOT EXISTS idx_digital_assets_password ON digital_assets(account_password) WHERE account_password IS NOT NULL;
