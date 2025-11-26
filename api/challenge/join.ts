import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { challenge_id, user_id } = req.body || req.query;

        if (!challenge_id) {
            return res.status(400).json({ error: 'Missing challenge_id' });
        }

        // Fetch challenge details
        const challenge = await sql`
            SELECT * FROM challenges WHERE id = ${challenge_id}
        `;

        if (challenge.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const data = challenge[0];

        // If user_id is provided and different from creator, join as opponent
        if (user_id && user_id !== data.creator_id && !data.opponent_id) {
            await sql`
                UPDATE challenges 
                SET opponent_id = ${user_id}, status = 'active'
                WHERE id = ${challenge_id}
            `;
            data.opponent_id = user_id;
            data.status = 'active';
        }

        // Fetch actual question details
        // We need to fetch the questions to send to the client
        // But we should NOT send the answers if the user hasn't finished? 
        // Actually, the client needs answers to validate locally or we validate on server.
        // For simplicity matching current architecture, we send questions with answers 
        // (client-side validation is used in this app currently).

        // Parse question_ids from JSONB if needed (neon returns it as object usually)
        const qIds = Array.isArray(data.question_ids) ? data.question_ids : JSON.parse(data.question_ids);

        if (qIds.length > 0) {
            const questions = await sql`
                SELECT * FROM questions WHERE id = ANY(${qIds})
            `;
            // Sort questions to match the order in question_ids
            const sortedQuestions = qIds.map((id: number) => questions.find((q: any) => q.id === id));
            data.questions = sortedQuestions;
        }

        return res.status(200).json({
            success: true,
            challenge: data
        });

    } catch (error: any) {
        console.error('Error joining challenge:', error);
        return res.status(500).json({ error: error.message });
    }
}
