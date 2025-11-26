import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function updateSchema() {
    try {
        console.log('Updating database schema...');

        // 1. Add nickname to users table
        console.log('Adding nickname to users table...');
        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT`;
        } catch (e) {
            console.log('Nickname column might already exist or error:', e);
        }

        // 2. Add badges to leaderboard table
        console.log('Adding badges to leaderboard table...');
        try {
            await sql`ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb`;
        } catch (e) {
            console.log('Badges column might already exist or error:', e);
        }

        // 3. Create challenges table
        console.log('Creating challenges table...');
        await sql`
            CREATE TABLE IF NOT EXISTS challenges (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                creator_id TEXT NOT NULL,
                opponent_id TEXT,
                unit TEXT NOT NULL,
                question_ids JSONB NOT NULL,
                creator_score INTEGER,
                opponent_score INTEGER,
                status TEXT DEFAULT 'pending', -- pending, active, completed
                winner_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Enable RLS for challenges
        await sql`ALTER TABLE challenges ENABLE ROW LEVEL SECURITY`;

        // Policies for challenges
        await sql`DROP POLICY IF EXISTS "Public read challenges" ON challenges`;
        await sql`CREATE POLICY "Public read challenges" ON challenges FOR SELECT USING (true)`;

        await sql`DROP POLICY IF EXISTS "Authenticated insert challenges" ON challenges`;
        await sql`CREATE POLICY "Authenticated insert challenges" ON challenges FOR INSERT WITH CHECK (auth.uid()::text = creator_id)`;

        await sql`DROP POLICY IF EXISTS "Participants update challenges" ON challenges`;
        await sql`CREATE POLICY "Participants update challenges" ON challenges FOR UPDATE USING (
            auth.uid()::text = creator_id OR auth.uid()::text = opponent_id OR opponent_id IS NULL
        )`;

        console.log('Schema update completed successfully.');

    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

updateSchema();
