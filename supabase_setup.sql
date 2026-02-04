-- SQL Migration for Yarn Meeting Catalyst
-- Run this in your Supabase SQL Editor

-- 1. Create Meetings Table
CREATE TABLE IF NOT EXISTS catalyst_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'brainstorming' CHECK (status IN ('brainstorming', 'voting', 'active', 'finished')),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Create Responses Table
CREATE TABLE IF NOT EXISTS catalyst_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meeting_id UUID REFERENCES catalyst_meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    worrying TEXT,
    going_well TEXT,
    could_do_better TEXT
);

-- 3. Create Agenda Items Table
CREATE TABLE IF NOT EXISTS catalyst_agenda_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meeting_id UUID REFERENCES catalyst_meetings(id) ON DELETE CASCADE,
    theme TEXT NOT NULL,
    description TEXT,
    action_points TEXT[], -- Array of strings
    votes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE catalyst_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE catalyst_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE catalyst_agenda_items;

-- 5. RLS (Row Level Security) - Basic team access
-- Assuming team members are in auth.users
ALTER TABLE catalyst_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalyst_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalyst_agenda_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read meetings" ON catalyst_meetings FOR SELECT USING (true);
CREATE POLICY "Allow users to create meetings" ON catalyst_meetings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to read responses" ON catalyst_responses FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own responses" ON catalyst_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read agenda items" ON catalyst_agenda_items FOR SELECT USING (true);
CREATE POLICY "Allow users to vote/update agenda items" ON catalyst_agenda_items FOR UPDATE USING (true);
