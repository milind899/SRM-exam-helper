import postgres from 'postgres';

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const connectionString = process.env.helper_POSTGRES_URL ||
            process.env.POSTGRES_URL ||
            process.env.DATABASE_URL;

        if (!connectionString) {
            return res.status(500).json({ error: 'Database configuration missing' });
        }

        const sql = postgres(connectionString);
        const { challenge_id, user_id } = req.query;

        if (!challenge_id) {
            await sql.end();
            return res.status(400).json({ error: 'Challenge ID is required' });
        }

        // Fetch challenge
        const challenges = await sql`
            SELECT * FROM challenges WHERE id = ${challenge_id}
        `;

        if (challenges.length === 0) {
            await sql.end();
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challenge = challenges[0];

        // If user is joining (not the creator), update opponent_id
        if (user_id && user_id !== challenge.creator_id && !challenge.opponent_id) {
            await sql`
                UPDATE challenges 
                SET opponent_id = ${user_id}, status = 'active'
                WHERE id = ${challenge_id}
            `;
            challenge.opponent_id = user_id;
            challenge.status = 'active';
        }

        // Fetch questions
        const questionIds = challenge.question_ids;
        const questions = await sql`
            SELECT id, question, options, answer 
            FROM questions 
            WHERE id = ANY(${questionIds})
        `;

        await sql.end();

        return res.status(200).json({
            success: true,
            challenge: {
                ...challenge,
                questions
            }
        });

    } catch (error: any) {
        console.error('Error fetching challenge:', error);
        return res.status(500).json({
            error: `DB Error: ${error.message}`
        });
    }
}
