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

            return res.status(200).json(entries);
        }

        if (req.method === 'POST') {
            // Update user's progress
            const { userId, nickname, progressPercentage, completedItems, totalItems } = req.body;

            if (!userId || !nickname) {
                return res.status(400).json({ error: 'Missing required fields' });
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

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Leaderboard API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
