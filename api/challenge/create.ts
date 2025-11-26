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
        const { creator_id, unit } = req.body;

        if (!creator_id || !unit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch 10 random questions for the unit
        // Note: Using a simple random sort. For large datasets, TABLESAMPLE is better but this works for now.
        const questions = await sql`
            SELECT id FROM questions 
            WHERE unit = ${unit} 
            ORDER BY RANDOM() 
            LIMIT 10
        `;

        if (questions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this unit' });
        }

        const questionIds = questions.map(q => q.id);

        // Create the challenge
        const challenge = await sql`
            INSERT INTO challenges (creator_id, unit, question_ids, status)
            VALUES (${creator_id}, ${unit}, ${JSON.stringify(questionIds)}, 'pending')
            RETURNING id
        `;

        return res.status(200).json({
            success: true,
            challengeId: challenge[0].id
        });

    } catch (error: any) {
        console.error('Error creating challenge:', error);
        return res.status(500).json({ error: error.message });
    }
}
