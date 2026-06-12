-- Task workspace columns — run in Supabase SQL Editor
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS work_content text DEFAULT '';
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS work_visible boolean DEFAULT false;
ALTER TABLE team_tasks ADD COLUMN IF NOT EXISTS work_updated_at timestamptz;
