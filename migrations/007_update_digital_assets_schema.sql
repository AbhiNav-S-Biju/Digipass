-- Update Digital Assets Table Schema
-- Migrate from unstructured JSON to structured data with normalized columns

-- Add new columns
ALTER TABLE digital_assets
ADD COLUMN IF NOT EXISTS platform_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS account_identifier VARCHAR(255),
ADD COLUMN IF NOT EXISTS action_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_message TEXT;

-- Create indices for common queries
CREATE INDEX IF NOT EXISTS idx_digital_assets_platform ON digital_assets(platform_name);
CREATE INDEX IF NOT EXISTS idx_digital_assets_category ON digital_assets(category);
CREATE INDEX IF NOT EXISTS idx_digital_assets_action ON digital_assets(action_type);

-- Note: Keep encrypted_data for backward compatibility with existing records
-- New records will use structured columns instead
