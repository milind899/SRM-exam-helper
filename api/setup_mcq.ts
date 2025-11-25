import { neon } from '@neondatabase/serverless';
import questionsData from './questions_data.json';

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
        console.log('Starting seed process via API...');

        // Optional: Add a simple secret key check if needed, but for now we'll leave it open or check for admin role if we had one.
        // Or just let it be open for this setup phase.

        // Create tables if they don't exist (just in case)
        await sql`
            CREATE TABLE IF NOT EXISTS questions(
                id SERIAL PRIMARY KEY,
                unit VARCHAR(255) NOT NULL,
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                answer VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS user_test_results(
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Check if data already exists
        const count = await sql`SELECT COUNT(*) FROM questions`;
        if (count[0].count > 0) {
            // If force param is not present, return
            if (req.query.force !== 'true') {
                return res.status(200).json({ message: 'Data already exists. Use ?force=true to re-seed.' });
            }
            // If force, maybe delete? Or just append?
            // Let's delete to be clean
            await sql`DELETE FROM questions`;
        }

        // Insert data
        for (const q of questionsData) {
            await sql`
                INSERT INTO questions (unit, question, options, answer)
                VALUES (${q.unit}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer})
            `;
        }

        return res.status(200).json({
            success: true,
            message: `Successfully seeded ${questionsData.length} questions.`,
            count: questionsData.length
        });

    } catch (error: any) {
        console.error('Error seeding data:', error);
        return res.status(500).json({ error: error.message });
    }
}
