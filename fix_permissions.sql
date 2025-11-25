-- Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to read questions
DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);

-- Enable RLS on user_test_results
ALTER TABLE user_test_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read results (for leaderboard)
DROP POLICY IF EXISTS "Public read results" ON user_test_results FOR SELECT USING (true);
CREATE POLICY "Public read results" ON user_test_results FOR SELECT USING (true);

-- Allow authenticated users to insert their results
DROP POLICY IF EXISTS "Authenticated insert results" ON user_test_results;
CREATE POLICY "Authenticated insert results" ON user_test_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
