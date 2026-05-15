-- SQLBook: Code
-- Enable Row Level Security (RLS) on the tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Policies for 'users' table
-- ==========================================

-- 1. Everyone can read all users (Required for the Leaderboard)
CREATE POLICY "Allow public read access to users"
ON users FOR SELECT
USING (true);

-- 2. Users can only update their own row
CREATE POLICY "Allow users to update their own record"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 3. Users can insert their own row (used during sign up)
CREATE POLICY "Allow users to insert their own record"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ==========================================
-- Policies for 'waste_logs' table
-- ==========================================

-- 1. Users can only read their own logs
CREATE POLICY "Allow users to read their own logs"
ON waste_logs FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can only insert logs tied to their own ID
CREATE POLICY "Allow users to insert their own logs"
ON waste_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);
