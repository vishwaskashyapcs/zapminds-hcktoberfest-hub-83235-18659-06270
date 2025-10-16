-- Create enum types
CREATE TYPE public.participant_role AS ENUM ('Software Engineer', 'UI/UX Designer', 'Product Manager', 'Data Scientist', 'Full Stack Developer', 'AI Engineer', 'Other');
CREATE TYPE public.event_type AS ENUM ('workshop', 'presentation', 'deadline', 'networking', 'judging');

-- Participants/Registrations table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team_name TEXT,
  role participant_role NOT NULL,
  skills TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  motivation TEXT,
  avatar_emoji TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants"
  ON public.participants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can register as participant"
  ON public.participants FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Participants can update own profile"
  ON public.participants FOR UPDATE
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  looking_for_members BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team creators can update their teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (created_by IN (SELECT id FROM public.participants WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Team members junction table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, participant_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can join teams"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  team_name TEXT NOT NULL,
  description TEXT,
  problem TEXT,
  solution TEXT,
  tech_stack TEXT[],
  learnings TEXT,
  cover_image TEXT,
  demo_url TEXT,
  github_url TEXT,
  presentation_url TEXT,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

-- Events/Schedule table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Discussions/Forum table
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  category TEXT,
  replies INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view discussions"
  ON public.discussions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create discussions"
  ON public.discussions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Discussion replies table
CREATE TABLE public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON public.discussion_replies FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create replies"
  ON public.discussion_replies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Updates/Announcements table
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'announcement',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view updates"
  ON public.updates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create updates"
  ON public.updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.updates;