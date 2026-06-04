-- Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new

CREATE TABLE IF NOT EXISTS team_bulletins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  priority text DEFAULT 'info',
  pinned boolean DEFAULT false,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_bulletins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON team_bulletins FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_bulletins FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete" ON team_bulletins FOR DELETE USING (true);
