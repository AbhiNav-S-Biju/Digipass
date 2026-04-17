ALTER TABLE executors
ADD COLUMN IF NOT EXISTS executor_password_hash TEXT;
