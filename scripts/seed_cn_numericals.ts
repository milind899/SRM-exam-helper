import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.helper_POSTGRES_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
}

const sql = postgres(connectionString);

async function seed() {
    try {
        console.log('Starting Computer Networks Numericals seed process...');

        // Read the CN numericals file
        const filePath = path.join(process.cwd(), 'api', 'leaderboard', '🔥 COMPUTER NETWORKS – NUMERICAL QUESTIONS.txt');
        const content = fs.readFileSync(filePath, 'utf-8');

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
            if (line.includes('PRIORITY') && (line.startsWith('🟩') || line.startsWith('🟨') || line.startsWith('🟦') || line.startsWith('🟪') || line.startsWith('🟫'))) {
                currentUnit = line.replace(/[🟩🟨🟦🟪🟫]/g, '').trim();
                console.log(`Processing: ${currentUnit}`);
                continue;
            }

            // Check for Question Start (e.g., "1. Question text")
            const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (questionMatch) {
                // Save previous question if exists
                if (currentQuestion && Object.keys(currentOptions).length > 0 && currentAnswer) {
                    questions.push({
                        unit: currentUnit,
                        question: currentQuestion,
                        options: currentOptions,
                        answer: currentAnswer
                    });
                }

                // Reset for new question
                currentQuestion = questionMatch[2];
                currentOptions = {};
                currentAnswer = '';
                isCollectingQuestion = true;
                continue;
            }

            // Check for Options (e.g., "(A) Option text")
            const optionMatch = line.match(/^\(([A-D])\)\s+(.*)/);
            if (optionMatch) {
                isCollectingQuestion = false;
                currentOptions[optionMatch[1]] = optionMatch[2];
                continue;
            }

            // Check for Answer (e.g., "Answer: (C) Presentation")
            const answerMatch = line.match(/^Answer:\s+\(([A-D])\)/);
            if (answerMatch) {
                isCollectingQuestion = false;
                currentAnswer = answerMatch[1];
                continue;
            }

            // If verified line, ignore
            if (line.startsWith('All answers')) continue;

            // If collecting question and not an option/answer, append to question text
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

        console.log(`Found ${questions.length} CN numerical questions.`);

        // Insert into DB
        console.log('Inserting CN numerical questions into database...');

        for (const q of questions) {
            await sql`
                INSERT INTO questions (unit, question, options, answer)
                VALUES (${q.unit}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer})
            `;
        }

        console.log('CN Numericals seed completed successfully!');
        await sql.end();

    } catch (error) {
        console.error('Error seeding CN numericals:', error);
        process.exit(1);
    }
}

seed();
