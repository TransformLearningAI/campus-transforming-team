-- ═══════════════════════════════════════════════════════════
-- SITE SUGGESTIONS — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new
-- Lets team members suggest edits to the marketing site.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL,
  page_url text,
  section text,
  current_text text,
  suggested_text text NOT NULL,
  reason text,
  status text DEFAULT 'open',
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON site_suggestions FOR SELECT USING (true);
CREATE POLICY "public_insert" ON site_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON site_suggestions FOR UPDATE USING (true);
CREATE POLICY "public_delete" ON site_suggestions FOR DELETE USING (true);
