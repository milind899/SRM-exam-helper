import { neon } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: Request) {
    try {
        if (req.method === 'GET') {
            // Fetch top 20 leaderboard entries
            const entries = await sql`
        SELECT 
          user_id, 
          nickname, 
          progress_percentage, 
          completed_items, 
          total_items, 
          last_updated
        FROM leaderboard
        ORDER BY progress_percentage DESC, last_updated DESC
        LIMIT 20
      `;

            return new Response(JSON.stringify(entries), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'POST') {
            // Update user's progress
            const { userId, nickname, progressPercentage, completedItems, totalItems } = await req.json();

            if (!userId || !nickname) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            await sql`
        INSERT INTO leaderboard (
          user_id, 
          nickname, 
          progress_percentage, 
          completed_items, 
          total_items
        )
        VALUES (
          ${userId}, 
          ${nickname}, 
          ${progressPercentage}, 
          ${completedItems}, 
          ${totalItems}
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          nickname = EXCLUDED.nickname,
          progress_percentage = EXCLUDED.progress_percentage,
          completed_items = EXCLUDED.completed_items,
          total_items = EXCLUDED.total_items,
          last_updated = CURRENT_TIMESTAMP
      `;

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Leaderboard API error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
