import { getQuestionsByUnit, getTestQuestions } from './parser';

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
            questions = getQuestionsByUnit(unit || 'random', parseInt(limit));
        } else if (mode === 'test') {
            questions = getTestQuestions();
        } else {
            return res.status(400).json({ error: 'Invalid mode. Use mode=practice or mode=test' });
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                error: 'No questions found',
                hint: 'Questions file might be empty or not found'
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
