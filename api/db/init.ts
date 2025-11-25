import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
