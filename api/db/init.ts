import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Create leaderboard table if it doesn't exist
        await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id VARCHAR(255) PRIMARY KEY,
        nickname VARCHAR(100) NOT NULL,
        tagline VARCHAR(50),
        progress_data JSONB,
        progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        completed_items INTEGER NOT NULL DEFAULT 0,
        total_items INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create questions table for MCQ
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

        // Create user_test_results table
        await sql`
      CREATE TABLE IF NOT EXISTS user_test_results(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

        // Add columns if they don't exist (migration)

        try {
            await sql`ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS tagline VARCHAR(50)`;
            await sql`ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS progress_data JSONB`;
            await sql`ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        } catch (e) {
            console.log('Columns might already exist', e);
        }

        // Create index for faster queries
        await sql`
      CREATE INDEX IF NOT EXISTS idx_progress 
      ON leaderboard(progress_percentage DESC, updated_at DESC)
    `;

        // Enable Row Level Security (RLS)
        try {
            await sql`ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY`;

            // Drop existing policies to avoid conflicts
            await sql`DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard`;
            await sql`DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leaderboard`;
            await sql`DROP POLICY IF EXISTS "Enable update for users based on user_id" ON leaderboard`;

            // Create policies
            await sql`
                CREATE POLICY "Enable read access for all users" ON leaderboard FOR SELECT USING(true)
        `;

            await sql`
                CREATE POLICY "Enable insert for authenticated users only" ON leaderboard 
                FOR INSERT WITH CHECK(auth.uid():: text = user_id)
        `;

            await sql`
                CREATE POLICY "Enable update for users based on user_id" ON leaderboard 
                FOR UPDATE USING(auth.uid():: text = user_id)
            `;

            // RLS for Questions (Public Read)
            await sql`ALTER TABLE questions ENABLE ROW LEVEL SECURITY`;
            await sql`DROP POLICY IF EXISTS "Public read questions" ON questions`;
            await sql`CREATE POLICY "Public read questions" ON questions FOR SELECT USING(true)`;

            // RLS for Test Results
            await sql`ALTER TABLE user_test_results ENABLE ROW LEVEL SECURITY`;
            await sql`DROP POLICY IF EXISTS "Public read results" ON user_test_results`;
            await sql`CREATE POLICY "Public read results" ON user_test_results FOR SELECT USING(true)`;
            await sql`DROP POLICY IF EXISTS "Authenticated insert results" ON user_test_results`;
            await sql`CREATE POLICY "Authenticated insert results" ON user_test_results FOR INSERT WITH CHECK(auth.role() = 'authenticated')`;

        } catch (e) {
            console.log('Error setting up RLS:', e);
        }

        // Force PostgREST schema cache reload
        try {
            await sql`NOTIFY pgrst, 'reload config'`;
        } catch (e) {
            console.log('Error reloading schema cache:', e);
        }

        return res.status(200).json({
            success: true,
            message: 'Database initialized successfully!'
        });
    } catch (error: any) {
        console.error('Database init error:', error);
        return res.status(500).json({
            error: error.message,
            hint: 'If table already exists, this is normal and can be ignored.'
        });
    }
}
