ALTER TABLE executors
ADD COLUMN IF NOT EXISTS verification_token_hash TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;
