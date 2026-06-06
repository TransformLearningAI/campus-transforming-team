-- ═══════════════════════════════════════════════════════════
-- ONBOARDING PROGRESS — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new
-- Persists the Getting Started checklist per member so it syncs
-- across devices (previously localStorage-only).
-- ═══════════════════════════════════════════════════════════

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS onboarding_steps jsonb DEFAULT '[]'::jsonb;

-- onboarding_completed already exists from supabase-setup.sql; this is a
-- no-op safeguard if you're applying to an older schema.
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
