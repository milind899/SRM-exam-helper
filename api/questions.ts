import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Check if DATABASE_URL exists
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({
                error: 'DATABASE_URL is not configured',
                hint: 'Please add DATABASE_URL to Vercel environment variables'
            });
        }

        const sql = neon(process.env.DATABASE_URL);
        const { mode, unit, limit = 30 } = req.query;

        let questions;

        if (mode === 'practice') {
            if (unit && unit !== 'random') {
                questions = await sql`
                    SELECT id, unit, question, options, answer 
                    FROM questions 
                    WHERE unit ILIKE ${'%' + unit + '%'}
                    ORDER BY RANDOM() 
                    LIMIT ${limit}
                `;
            } else {
                questions = await sql`
                    SELECT id, unit, question, options, answer 
                    FROM questions 
                    ORDER BY RANDOM() 
                    LIMIT ${limit}
                `;
            }
        } else if (mode === 'test') {
            const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
            const questionsPerUnit = 6;

            const allQuestions = [];

            for (const u of units) {
                const unitQuestions = await sql`
                    SELECT id, unit, question, options, answer 
                    FROM questions 
                    WHERE unit ILIKE ${'%' + u + '%'}
                    ORDER BY RANDOM() 
                    LIMIT ${questionsPerUnit}
                `;
                allQuestions.push(...unitQuestions);
            }

            questions = allQuestions.sort(() => Math.random() - 0.5);
        } else {
            return res.status(400).json({ error: 'Invalid mode. Use mode=practice or mode=test' });
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                error: 'No questions found',
                hint: 'Database might be empty. Please seed it using seed.sql'
            });
        }

        return res.status(200).json({ questions });
    } catch (error: any) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
            error: error.message,
            type: error.constructor.name,
            hint: 'Check Vercel function logs for details'
        });
    }
}
