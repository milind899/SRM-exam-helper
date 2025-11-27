import postgres from 'postgres';

export default async function handler(req: any, res: any) {
    const connectionString = process.env.helper_POSTGRES_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL;

    if (!connectionString) {
        return res.status(500).json({ error: 'Database configuration missing' });
    }

    const sql = postgres(connectionString);
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('Creating MCQ tables...');

        // Create tables if they don't exist
        await sql`
            CREATE TABLE IF NOT EXISTS questions(
                id SERIAL PRIMARY KEY,
                unit VARCHAR(255) NOT NULL,
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                answer VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS user_test_results(
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Enable RLS
        await sql`ALTER TABLE questions ENABLE ROW LEVEL SECURITY`;
        await sql`DROP POLICY IF EXISTS "Public read questions" ON questions`;
        await sql`CREATE POLICY "Public read questions" ON questions FOR SELECT USING(true)`;

        await sql`ALTER TABLE user_test_results ENABLE ROW LEVEL SECURITY`;
        await sql`DROP POLICY IF EXISTS "Public read results" ON user_test_results`;
        await sql`CREATE POLICY "Public read results" ON user_test_results FOR SELECT USING(true)`;
        await sql`DROP POLICY IF EXISTS "Authenticated insert results" ON user_test_results`;
        await sql`CREATE POLICY "Authenticated insert results" ON user_test_results FOR INSERT WITH CHECK(true)`;

        // Create users table for Admin List
        await sql`
            CREATE TABLE IF NOT EXISTS users(
                id UUID PRIMARY KEY,
                email TEXT NOT NULL,
                nickname TEXT,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Enable RLS for users table
        await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;

        // Allow users to insert/update their own data
        await sql`DROP POLICY IF EXISTS "Users can insert own data" ON users`;
        await sql`CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id)`;

        await sql`DROP POLICY IF EXISTS "Users can update own data" ON users`;
        await sql`CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id)`;

        // Allow public read for now (for Admin List simplicity, can be restricted later)
        await sql`DROP POLICY IF EXISTS "Public read users" ON users`;
        await sql`CREATE POLICY "Public read users" ON users FOR SELECT USING (true)`;

        // Create challenges table
        await sql`
            CREATE TABLE IF NOT EXISTS challenges (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                creator_id TEXT NOT NULL,
                opponent_id TEXT,
                unit TEXT NOT NULL,
                question_ids JSONB NOT NULL,
                creator_score INTEGER,
                opponent_score INTEGER,
                status TEXT DEFAULT 'pending',
                winner_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`ALTER TABLE challenges ENABLE ROW LEVEL SECURITY`;

        await sql`DROP POLICY IF EXISTS "Public read challenges" ON challenges`;
        await sql`CREATE POLICY "Public read challenges" ON challenges FOR SELECT USING (true)`;

        await sql`DROP POLICY IF EXISTS "Authenticated insert challenges" ON challenges`;
        await sql`CREATE POLICY "Authenticated insert challenges" ON challenges FOR INSERT WITH CHECK (auth.uid()::text = creator_id)`;

        await sql`DROP POLICY IF EXISTS "Participants update challenges" ON challenges`;
        await sql`CREATE POLICY "Participants update challenges" ON challenges FOR UPDATE USING (
            auth.uid()::text = creator_id OR auth.uid()::text = opponent_id OR opponent_id IS NULL
        )`;

        // Add badges to leaderboard if not exists (idempotent check hard in raw sql block here, relying on alter in update script for existing)
        // For new setup, create table with badges
        await sql`
            CREATE TABLE IF NOT EXISTS leaderboard (
                user_id UUID PRIMARY KEY,
                nickname TEXT NOT NULL,
                tagline TEXT,
                progress_percentage INTEGER DEFAULT 0,
                completed_items INTEGER DEFAULT 0,
                total_items INTEGER DEFAULT 0,
                badges JSONB DEFAULT '[]'::jsonb,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const count = await sql`SELECT COUNT(*) FROM questions`;
        const questionCount = parseInt(count[0].count);

        await sql.end();

        return res.status(200).json({
            success: true,
            message: questionCount > 0
                ? `Tables created. Database has ${questionCount} questions.`
                : 'Tables created. Please seed questions using the seed_mcq.ts script locally, then push to production database.',
            questionCount
        });

    } catch (error: any) {
        console.error('Error setting up MCQ:', error);
        return res.status(500).json({
            error: error.message,
            hint: 'Check Vercel logs for details'
        });
    }
}
