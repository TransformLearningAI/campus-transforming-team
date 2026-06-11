-- Task comments & progress — run in Supabase SQL Editor

-- Add progress and deliverable_url columns to team_tasks
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS deliverable_url text;

-- Task comments table
CREATE TABLE IF NOT EXISTS team_task_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES team_tasks(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES team_members(id) NOT NULL,
  member_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE team_task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON team_task_comments FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete" ON team_task_comments FOR DELETE USING (true);
