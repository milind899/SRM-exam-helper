import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

function parseQuestionFile(content: string) {
    const lines = content.split('\n');
    let currentUnit = '';
    let currentQuestion = '';
    let currentOptions: Record<string, string> = {};
    let currentAnswer = '';
    let isCollectingQuestion = false;

    const questions = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        // Check for Unit/Priority Header
        if (line.match(/^[🟩🟨🟦🟪🟫🟧]/)) {
            currentUnit = line.replace(/[🟩🟨🟦🟪🟫🟧]/g, '').trim();
            continue;
        }

        // Check for Question Start
        const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (questionMatch) {
            if (currentQuestion && Object.keys(currentOptions).length > 0 && currentAnswer) {
                questions.push({
                    unit: currentUnit,
                    question: currentQuestion,
                    options: currentOptions,
                    answer: currentAnswer
                });
            }

            currentQuestion = questionMatch[2];
            currentOptions = {};
            currentAnswer = '';
            isCollectingQuestion = true;
            continue;
        }

        // Check for Options
        const optionMatch = line.match(/^\(([A-D])\)\s+(.*)/);
        if (optionMatch) {
            isCollectingQuestion = false;
            currentOptions[optionMatch[1]] = optionMatch[2];
            continue;
        }

        // Check for Answer
        const answerMatch = line.match(/^Answer:\s+\(([A-D])\)/);
        if (answerMatch) {
            isCollectingQuestion = false;
            currentAnswer = answerMatch[1];
            continue;
        }

        if (line.startsWith('All answers')) continue;

        if (isCollectingQuestion) {
            currentQuestion += ' ' + line;
        }
    }

    // Push last question
    if (currentQuestion && Object.keys(currentOptions).length > 0 && currentAnswer) {
        questions.push({
            unit: currentUnit,
            question: currentQuestion,
            options: currentOptions,
            answer: currentAnswer
        });
    }

    return questions;
}

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

        // Read and parse question files
        const leaderboardDir = path.join(process.cwd(), 'api', 'leaderboard');
        const files = fs.readdirSync(leaderboardDir).filter(f => f.endsWith('.txt'));

        let allQuestions: any[] = [];
        for (const file of files) {
            const content = fs.readFileSync(path.join(leaderboardDir, file), 'utf-8');
            const questions = parseQuestionFile(content);
            allQuestions = allQuestions.concat(questions);
        }

        console.log(`Inserting ${allQuestions.length} questions...`);

        for (const q of allQuestions) {
            await sql`
                INSERT INTO questions (unit, question, options, answer)
                VALUES (${q.unit}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer})
            `;
        }

        await sql.end();

        return res.status(200).json({
            success: true,
            message: `Successfully seeded ${allQuestions.length} questions!`,
            questionCount: allQuestions.length
        });

    } catch (error: any) {
        console.error('Error seeding database:', error);
        return res.status(500).json({
            error: `Seed error: ${error.message}`
        });
    }
}
