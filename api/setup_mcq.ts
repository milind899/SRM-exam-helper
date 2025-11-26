import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
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

        // Check if data exists
        const count = await sql`SELECT COUNT(*) FROM questions`;
        const questionCount = parseInt(count[0].count);

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
