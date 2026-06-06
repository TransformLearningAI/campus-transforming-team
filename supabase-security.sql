-- ═══════════════════════════════════════════════════════════
-- SECURITY HARDENING (RECOMMENDED) — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new
--
-- Why: team_members has a "public_read USING (true)" policy, so the public
-- (anon) API key could read EVERY row — including password_hash. Auth now
-- runs server-side (app/api/auth/* with the service-role key), and no client
-- code selects password_hash anymore, so the browser no longer needs access
-- to that column.
--
-- This revokes column-level read access to password_hash from the public
-- API roles. The service-role key (used by the auth routes) bypasses this,
-- so logins keep working. Safe to run AFTER deploying this codebase.
-- ═══════════════════════════════════════════════════════════

REVOKE SELECT (password_hash) ON team_members FROM anon;
REVOKE SELECT (password_hash) ON team_members FROM authenticated;

-- Note: existing passwords are stored as base64 (btoa). The app transparently
-- re-hashes each account with scrypt on its next successful login, so no
-- manual migration is needed — the hashes upgrade themselves over time.
