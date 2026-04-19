-- Add preferred_action field to digital_assets table
-- Stores user's preference for what should happen to the asset (e.g., "Memorialise", "Delete", "Transfer", "Download data")

BEGIN;

ALTER TABLE digital_assets
ADD COLUMN IF NOT EXISTS preferred_action VARCHAR(100) DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_digital_assets_preferred_action 
ON digital_assets(preferred_action);

COMMIT;
