-- ============================================================
-- Receipt column rename migration
-- Run this in the Supabase SQL editor ONLY if the payments table
-- was created from the OLD schema that named the column receipt_image.
-- If you are starting fresh (running supabase-schema.sql on a new project),
-- skip this file — the schema already uses receipt_url.
-- ============================================================

ALTER TABLE payments RENAME COLUMN receipt_image TO receipt_url;
