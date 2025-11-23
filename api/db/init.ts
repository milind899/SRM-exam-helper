import { neon } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: Request) {
    try {
        if (req.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create leaderboard table if it doesn't exist
        await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id VARCHAR(255) PRIMARY KEY,
        nickname VARCHAR(100) NOT NULL,
        progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        completed_items INTEGER NOT NULL DEFAULT 0,
        total_items INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create index for faster queries
        await sql`
      CREATE INDEX IF NOT EXISTS idx_progress 
      ON leaderboard(progress_percentage DESC, last_updated DESC)
    `;

        return new Response(JSON.stringify({
            success: true,
            message: 'Database initialized successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Database init error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            hint: 'If table already exists, this is normal and can be ignored.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
