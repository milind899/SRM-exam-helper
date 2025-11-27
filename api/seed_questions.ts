import postgres from 'postgres';
import questionsData from '../questions_data.json';

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST to seed database.' });
    }

    try {
        const connectionString = process.env.helper_POSTGRES_URL ||
            process.env.POSTGRES_URL ||
            process.env.DATABASE_URL;

        if (!connectionString) {
            return res.status(500).json({ error: 'Database configuration missing' });
        }

        const sql = postgres(connectionString);

        // Check if questions already exist
        const existingCount = await sql`SELECT COUNT(*) FROM questions`;
        const count = parseInt(existingCount[0].count);

        if (count > 0) {
            await sql.end();
            return res.status(200).json({
                message: `Database already has ${count} questions. Skipping seed to avoid duplicates.`,
                questionCount: count
            });
        }

        // Insert all questions from JSON
        console.log(`Inserting ${questionsData.length} questions...`);

        for (const q of questionsData as any[]) {
            await sql`
                INSERT INTO questions (unit, question, options, answer)
                VALUES (${q.unit}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer})
            `;
        }

        await sql.end();

        return res.status(200).json({
            success: true,
            message: `Successfully seeded ${questionsData.length} questions!`,
            questionCount: questionsData.length
        });

    } catch (error: any) {
        console.error('Error seeding database:', error);
        return res.status(500).json({
            error: `Seed error: ${error.message}`
        });
    }
}
