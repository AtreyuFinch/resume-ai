-- 2026-09-10: close drift between repo schema and live Supabase project.
-- Live `documents` table has three columns added after supabase-schema.sql was written.
-- Idempotent; safe to run more than once.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS suggested_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS type_mismatch BOOLEAN NOT NULL DEFAULT FALSE;
