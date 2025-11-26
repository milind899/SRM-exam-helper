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
        const { challenge_id, user_id, score } = req.body;

        if (!challenge_id || !user_id || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get current challenge state
        const challenge = await sql`SELECT * FROM challenges WHERE id = ${challenge_id}`;

        if (challenge.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const data = challenge[0];
        let updateQuery;

        if (user_id === data.creator_id) {
            updateQuery = sql`
                UPDATE challenges SET creator_score = ${score} WHERE id = ${challenge_id}
            `;
        } else if (user_id === data.opponent_id) {
            updateQuery = sql`
                UPDATE challenges SET opponent_score = ${score} WHERE id = ${challenge_id}
            `;
        } else {
            return res.status(403).json({ error: 'User not part of this challenge' });
        }

        await updateQuery;

        // Check if both have finished to determine winner
        const updatedChallenge = await sql`SELECT * FROM challenges WHERE id = ${challenge_id}`;
        const updated = updatedChallenge[0];

        if (updated.creator_score !== null && updated.opponent_score !== null) {
            let winnerId = null;
            if (updated.creator_score > updated.opponent_score) {
                winnerId = updated.creator_id;
            } else if (updated.opponent_score > updated.creator_score) {
                winnerId = updated.opponent_id;
            } else {
                winnerId = 'draw';
            }

            await sql`
                UPDATE challenges 
                SET status = 'completed', winner_id = ${winnerId}
                WHERE id = ${challenge_id}
            `;

            // Award Badge if not a draw
            if (winnerId && winnerId !== 'draw') {
                // Fetch current badges
                const userLeaderboard = await sql`SELECT badges FROM leaderboard WHERE user_id = ${winnerId}`;

                if (userLeaderboard.length > 0) {
                    const currentBadges = userLeaderboard[0].badges || [];
                    if (!currentBadges.includes('Challenge Winner 🏆')) {
                        const newBadges = [...currentBadges, 'Challenge Winner 🏆'];
                        await sql`
                            UPDATE leaderboard 
                            SET badges = ${JSON.stringify(newBadges)}::jsonb
                            WHERE user_id = ${winnerId}
                        `;
                    }
                }
            }
        }

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Error submitting challenge:', error);
        return res.status(500).json({ error: error.message });
    }
}
