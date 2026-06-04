-- ═══════════════════════════════════════════════════════════
-- TIMELINE TABLES — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS timeline_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  category text DEFAULT 'general',
  owner_name text,
  completed boolean DEFAULT false,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_item_id uuid REFERENCES timeline_items(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES team_members(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON timeline_items FOR SELECT USING (true);
CREATE POLICY "public_insert" ON timeline_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON timeline_items FOR UPDATE USING (true);

CREATE POLICY "public_read" ON timeline_comments FOR SELECT USING (true);
CREATE POLICY "public_insert" ON timeline_comments FOR INSERT WITH CHECK (true);
