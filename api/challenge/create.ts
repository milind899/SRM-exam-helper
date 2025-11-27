import postgres from 'postgres';

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
        // Supabase connection string priority
        const connectionString = process.env.helper_POSTGRES_URL || 
                                  process.env.POSTGRES_URL || 
                                  process.env.DATABASE_URL;

        if (!connectionString) {
            console.error('Database configuration missing');
            return res.status(500).json({ error: 'Database configuration missing' });
        }

        const sql = postgres(connectionString);
        const { creator_id, unit } = req.body;

        if (!creator_id || !unit) {
            await sql.end();
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch 10 random questions for the unit
        const questions = await sql`
            SELECT id FROM questions 
            WHERE unit = ${unit} 
            ORDER BY RANDOM() 
            LIMIT 10
        `;

        if (!questions || questions.length === 0) {
            await sql.end();
            return res.status(404).json({ error: 'No questions found for this unit' });
        }

        const questionIds = questions.map(q => q.id);

        // Create the challenge
        const challenge = await sql`
            INSERT INTO challenges (creator_id, unit, question_ids, status)
            VALUES (${creator_id}, ${unit}, ${JSON.stringify(questionIds)}, 'pending')
            RETURNING id
        `;

        await sql.end();

        return res.status(200).json({
            success: true,
            challengeId: challenge[0].id
        });

    } catch (error: any) {
        console.error('Error creating challenge:', error);
        return res.status(500).json({ 
            error: `DB Error: ${error.message}`
        });
    }
}
