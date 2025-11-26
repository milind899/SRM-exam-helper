import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function runSetup() {
    try {
        console.log('Creating users table...');

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

        // Allow public read for now (for Admin List simplicity)
        await sql`DROP POLICY IF EXISTS "Public read users" ON users`;
        await sql`CREATE POLICY "Public read users" ON users FOR SELECT USING (true)`;

        console.log('Users table created successfully.');

    } catch (error) {
        console.error('Error running setup:', error);
    }
}

runSetup();
