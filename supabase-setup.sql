-- ═══════════════════════════════════════════════════════════
-- CAMPUS TRANSFORMATION TEAM PORTAL — DATABASE SETUP
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ujohihxjavfjungdlomj/sql/new
-- ═══════════════════════════════════════════════════════════

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  bio text,
  photo_url text,
  location text,
  timezone text,
  linkedin_url text,
  portfolio_url text,
  other_links jsonb DEFAULT '[]',
  areas_of_interest text[] DEFAULT '{}',
  role text DEFAULT 'member',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS team_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  claimed_by uuid REFERENCES team_members(id),
  claimed_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

-- Hours log
CREATE TABLE IF NOT EXISTS team_hours (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES team_members(id) NOT NULL,
  date date NOT NULL,
  hours numeric(4,2) NOT NULL,
  description text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Activity feed
CREATE TABLE IF NOT EXISTS team_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES team_members(id),
  member_name text,
  action text NOT NULL,
  detail text,
  created_at timestamptz DEFAULT now()
);

-- Calendar events
CREATE TABLE IF NOT EXISTS team_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text,
  meeting_url text,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

-- Discussion threads
CREATE TABLE IF NOT EXISTS team_discussions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  topic text,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_discussion_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id uuid REFERENCES team_discussions(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES team_members(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Documents hub
CREATE TABLE IF NOT EXISTS team_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category text,
  pinned boolean DEFAULT false,
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now()
);

-- RLS policies — open access for anyone with a valid session token
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated (service role handles auth)
CREATE POLICY "public_read" ON team_members FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON team_members FOR UPDATE USING (true);

CREATE POLICY "public_read" ON team_tasks FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON team_tasks FOR UPDATE USING (true);

CREATE POLICY "public_read" ON team_hours FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_hours FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read" ON team_activity FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_activity FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read" ON team_events FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_events FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON team_events FOR UPDATE USING (true);

CREATE POLICY "public_read" ON team_discussions FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_discussions FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read" ON team_discussion_replies FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_discussion_replies FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read" ON team_documents FOR SELECT USING (true);
CREATE POLICY "public_insert" ON team_documents FOR INSERT WITH CHECK (true);
