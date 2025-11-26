import { readFileSync } from 'fs';
import { join } from 'path';

interface Question {
    id: number;
    unit: string;
    question: string;
    options: Record<string, string>;
    answer: string;
}

export function parseQuestionsFromFile(): Question[] {
    const filePath = join(process.cwd(), 'api', 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
    const content = readFileSync(filePath, 'utf-8');

    const questions: Question[] = [];
    let currentUnit = '';
    let questionId = 1;

    // Split by lines
    const lines = content.split('\n').map(line => line.trim());

    // Unit markers (emoji headers)
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

        // Check for unit headers
        for (const [emoji, unitName] of Object.entries(unitMarkers)) {
            if (line.includes(emoji)) {
                currentUnit = unitName;
                break;
            }
        }

        // Check for question start (e.g., "1. ", "2. ", etc.)
        const questionMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (questionMatch && currentUnit) {
            const questionText = questionMatch[2];
            const options: Record<string, string> = {};
            let answer = '';

            // Move to next line and collect options
            i++;
            while (i < lines.length) {
                const optionLine = lines[i];

                // Check for option (A), (B), (C), (D)
                const optionMatch = optionLine.match(/^\(([A-D])\)\s+(.+)/);
                if (optionMatch) {
                    const [, key, value] = optionMatch;
                    options[key] = value;
                    i++;
                    continue;
                }

                // Check for answer line
                if (optionLine.startsWith('Answer:')) {
                    answer = optionLine.replace('Answer:', '').trim();
                    break;
                }

                // If we hit empty line or next question, break
                if (!optionLine || questionMatch) {
                    break;
                }

                i++;
            }

            // Only add question if we have all required fields
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
}

export function getQuestionsByUnit(unit: string, limit: number = 30): Question[] {
    const allQuestions = parseQuestionsFromFile();

    if (unit === 'random' || !unit) {
        // Shuffle and return random questions
        return shuffleArray(allQuestions).slice(0, limit);
    }

    // Filter by unit (case insensitive)
    const filtered = allQuestions.filter(q =>
        q.unit.toLowerCase().includes(unit.toLowerCase())
    );

    return shuffleArray(filtered).slice(0, limit);
}

export function getTestQuestions(): Question[] {
    const allQuestions = parseQuestionsFromFile();
    const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
    const questionsPerUnit = 6;
    const testQuestions: Question[] = [];

    for (const unit of units) {
        const unitQuestions = allQuestions.filter(q => q.unit === unit);
        const shuffled = shuffleArray(unitQuestions);
        testQuestions.push(...shuffled.slice(0, questionsPerUnit));
    }

    // Shuffle the final test
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
