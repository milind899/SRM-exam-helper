import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { mode, unit, limit = 30 } = req.query;

        let questions;

        if (mode === 'practice') {
            if (unit && unit !== 'random') {
                // Fetch questions for specific unit
                // The unit in DB is like "UNIT 1...", so we might need partial match or exact match if frontend sends full name.
                // Let's assume frontend sends "UNIT 1" or similar, or we use ILIKE.
                questions = await sql`
                    SELECT id, unit, question, options, answer 
                    FROM questions 
                    WHERE unit ILIKE ${'%' + unit + '%'}
                    ORDER BY RANDOM() 
                    LIMIT ${limit}
                `;
            } else {
                // Random practice
                questions = await sql`
                    SELECT id, unit, question, options, answer 
                    FROM questions 
                    ORDER BY RANDOM() 
                    LIMIT ${limit}
                `;
            }
        } else if (mode === 'test') {
            // Test mode: 30 questions, weighted (equal from all units if possible, or just random)
            // User said "equal weightage from all unit, randomise each time".
            // We have 5 units. So 6 questions from each unit.

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

            // Shuffle the combined list
            questions = allQuestions.sort(() => Math.random() - 0.5);
        } else {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        return res.status(200).json({ questions });
    } catch (error: any) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ error: error.message });
    }
}
