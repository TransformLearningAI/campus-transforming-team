-- Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new

CREATE TABLE IF NOT EXISTS team_folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES team_folders(id) ON DELETE CASCADE,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON team_folders FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_folders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON team_folders FOR UPDATE USING (true);
CREATE POLICY "public_delete" ON team_folders FOR DELETE USING (true);

-- Add folder_id to existing documents table
ALTER TABLE team_documents ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES team_folders(id) ON DELETE SET NULL;

-- Add content column for documents created in-app (not just links)
ALTER TABLE team_documents ADD COLUMN IF NOT EXISTS content text;

-- Add type column to distinguish links from documents
ALTER TABLE team_documents ADD COLUMN IF NOT EXISTS type text DEFAULT 'link';

-- Allow delete on documents
CREATE POLICY "public_delete" ON team_documents FOR DELETE USING (true);
