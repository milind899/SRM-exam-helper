import { neon } from '@neondatabase/serverless';

// Check for DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.error('Please run this script with your DATABASE_URL, e.g.:');
    console.error('  $env:DATABASE_URL="your_connection_string"; node scripts/apply-rls.js');
    process.exit(1);
}

const sql = neon(connectionString);

async function applyRLS() {
    console.log('Applying RLS policies...');

    try {
        // Enable Row Level Security (RLS)
        await sql`ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY`;
        console.log('✅ Enabled RLS on leaderboard table');

        // Drop existing policies
        await sql`DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard`;
        await sql`DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leaderboard`;
        await sql`DROP POLICY IF EXISTS "Enable update for users based on user_id" ON leaderboard`;
        console.log('✅ Dropped existing policies');

        // Create policies
        await sql`
      CREATE POLICY "Enable read access for all users" ON leaderboard FOR SELECT USING (true)
    `;
        console.log('✅ Created SELECT policy');

        await sql`
      CREATE POLICY "Enable insert for authenticated users only" ON leaderboard 
      FOR INSERT WITH CHECK (auth.uid()::text = user_id)
    `;
        console.log('✅ Created INSERT policy');

        await sql`
      CREATE POLICY "Enable update for users based on user_id" ON leaderboard 
      FOR UPDATE USING (auth.uid()::text = user_id)
    `;
        console.log('✅ Created UPDATE policy');

        console.log('🎉 RLS policies applied successfully!');
    } catch (e) {
        console.error('❌ Error applying RLS:', e);
    }
}

applyRLS();
