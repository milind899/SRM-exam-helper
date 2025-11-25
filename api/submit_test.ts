import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_id, score, total_questions } = req.body;

        if (!user_id || score === undefined || !total_questions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert result
        await sql`
            INSERT INTO user_test_results (user_id, score, total_questions)
            VALUES (${user_id}, ${score}, ${total_questions})
        `;

        // Update leaderboard stats
        // We need to calculate new progress percentage or similar?
        // The user said "only test mode affect the leaderboard not unit progression".
        // So maybe we add a column for "test_score" or similar to leaderboard?
        // Or we just use the `user_test_results` for a separate leaderboard?
        // The current leaderboard has `progress_percentage`.
        // If the user wants this to affect the MAIN leaderboard, we need to decide how.
        // For now, let's just save the result. The leaderboard query might need to be updated to include test scores.
        // Or maybe we update `progress_data` with test scores.

        // Let's update `progress_data` in leaderboard table to include 'cn_test_score'.

        // First get existing data
        const existing = await sql`SELECT progress_data FROM leaderboard WHERE user_id = ${user_id}`;
        let currentData = existing[0]?.progress_data || {};

        // Update max score if higher
        const currentMax = currentData.cn_max_score || 0;
        if (score > currentMax) {
            currentData.cn_max_score = score;

            await sql`
                UPDATE leaderboard 
                SET progress_data = ${JSON.stringify(currentData)},
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ${user_id}
            `;
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error submitting test:', error);
        return res.status(500).json({ error: error.message });
    }
}
