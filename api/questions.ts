// Simple handler that works in both Vercel and local environments
// For local dev, it returns hardcoded sample questions
// For Vercel production, it parses from the text file

import { readFileSync } from 'fs';
import { join } from 'path';

interface Question {
    id: number;
    unit: string;
    question: string;
    options: Record<string, string>;
    answer: string;
}

function parseQuestionsFromFile(): Question[] {
    try {
        let content: string;

        // Try multiple paths for compatibility
        try {
            const filePath1 = join(__dirname, 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
            content = readFileSync(filePath1, 'utf-8');
        } catch {
            const filePath2 = join(process.cwd(), 'api', 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
            content = readFileSync(filePath2, 'utf-8');
        }

        const questions: Question[] = [];
        let currentUnit = '';
        let questionId = 1;

        const lines = content.split('\n').map(line => line.trim());

        const unitMarkers: Record<string, string> = {
            '🟦': 'UNIT 1',
            '🟩': 'UNIT 2',
            '🟧': 'UNIT 3',
            '🟨': 'UNIT 4',
            '🟪': 'UNIT 5'
        };

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];

            for (const [emoji, unitName] of Object.entries(unitMarkers)) {
                if (line.includes(emoji)) {
                    currentUnit = unitName;
                    break;
                }
            }

            const questionMatch = line.match(/^(\d+)\.\s+(.+)/);
            if (questionMatch && currentUnit) {
                const questionText = questionMatch[2];
                const options: Record<string, string> = {};
                let answer = '';

                i++;
                while (i < lines.length) {
                    const optionLine = lines[i];

                    const optionMatch = optionLine.match(/^\(([A-D])\)\s+(.+)/);
                    if (optionMatch) {
                        const [, key, value] = optionMatch;
                        options[key] = value;
                        i++;
                        continue;
                    }

                    if (optionLine.startsWith('Answer:')) {
                        answer = optionLine.replace('Answer:', '').trim();
                        break;
                    }

                    if (!optionLine || questionMatch) {
                        break;
                    }

                    i++;
                }

                if (Object.keys(options).length === 4 && answer) {
                    questions.push({
                        id: questionId++,
                        unit: currentUnit,
                        question: questionText,
                        options,
                        answer
                    });
                }
            }

            i++;
        }

        return questions;
    } catch (error) {
        console.error('Error parsing file:', error);
        // Return empty array if parsing fails
        return [];
    }
}

function getQuestionsByUnit(unit: string, limit: number = 30): Question[] {
    const allQuestions = parseQuestionsFromFile();

    if (unit === 'random' || !unit) {
        return shuffleArray(allQuestions).slice(0, limit);
    }

    const filtered = allQuestions.filter(q =>
        q.unit.toLowerCase().includes(unit.toLowerCase())
    );

    return shuffleArray(filtered).slice(0, limit);
}

function getTestQuestions(): Question[] {
    const allQuestions = parseQuestionsFromFile();
    const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
    const questionsPerUnit = 6;
    const testQuestions: Question[] = [];

    for (const unit of units) {
        const unitQuestions = allQuestions.filter(q => q.unit === unit);
        const shuffled = shuffleArray(unitQuestions);
        testQuestions.push(...shuffled.slice(0, questionsPerUnit));
    }

    return shuffleArray(testQuestions);
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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
                hint: 'Questions file might be empty or not found. Please check server logs.'
            });
        }

        return res.status(200).json({ questions });
    } catch (error: any) {
        console.error('Error in questions API:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            type: error.constructor.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            hint: 'Check server logs for details'
        });
    }
}
