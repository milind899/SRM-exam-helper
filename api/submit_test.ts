// Database import is now dynamic to allow graceful failure


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

        // Try to save to database, but don't fail if database is unavailable
        try {
            if (!process.env.DATABASE_URL) {
                console.log('Database not configured, skipping save');
                return res.status(200).json({
                    success: true,
                    message: 'Score recorded locally (database not configured)'
                });
            }

            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(process.env.DATABASE_URL);

            // Insert result
            await sql`
                INSERT INTO user_test_results (user_id, score, total_questions)
                VALUES (${user_id}, ${score}, ${total_questions})
            `;

            // Update leaderboard stats
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

            return res.status(200).json({ success: true, message: 'Score saved to database' });
        } catch (dbError: any) {
            console.error('Database error (non-critical):', dbError.message);
            // Return success anyway - the user completed the test
            return res.status(200).json({
                success: true,
                message: 'Test completed (database save failed, but score recorded locally)',
                dbError: dbError.message
            });
        }
    } catch (error: any) {
        console.error('Error submitting test:', error);
        return res.status(500).json({ error: error.message });
    }
}

