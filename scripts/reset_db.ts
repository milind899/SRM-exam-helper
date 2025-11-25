import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function resetDb() {
    try {
        console.log('Starting database reset...');

        // Drop tables
        console.log('Dropping existing tables...');
        await sql`DROP TABLE IF EXISTS leaderboard CASCADE`;
        await sql`DROP TABLE IF EXISTS questions CASCADE`;
        await sql`DROP TABLE IF EXISTS user_test_results CASCADE`;

        // Create leaderboard table
        console.log('Creating leaderboard table...');
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

        // Create questions table
        console.log('Creating questions table...');
        await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        unit VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        answer VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create user_test_results table
        console.log('Creating user_test_results table...');
        await sql`
      CREATE TABLE IF NOT EXISTS user_test_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Add RLS policies (simplified for script, but ideally should match init.ts)
        console.log('Enabling RLS...');
        await sql`ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY`;

        // Re-add policies (simplified)
        await sql`DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard`;
        await sql`CREATE POLICY "Enable read access for all users" ON leaderboard FOR SELECT USING (true)`;

        await sql`DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leaderboard`;
        await sql`CREATE POLICY "Enable insert for authenticated users only" ON leaderboard FOR INSERT WITH CHECK (auth.uid()::text = user_id)`;

        await sql`DROP POLICY IF EXISTS "Enable update for users based on user_id" ON leaderboard`;
        await sql`CREATE POLICY "Enable update for users based on user_id" ON leaderboard FOR UPDATE USING (auth.uid()::text = user_id)`;

        console.log('Database reset completed successfully!');

    } catch (error) {
        console.error('Error resetting database:', error);
    }
}

resetDb();
