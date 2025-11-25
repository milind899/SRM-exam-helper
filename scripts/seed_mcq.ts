import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
    try {
        console.log('Starting seed process...');

        // Read the file
        const filePath = path.join(process.cwd(), 'api', 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Split by Unit headers if multiple units are in one file, but here it seems to be one file per unit or mixed.
        // The file has "🟦 UNIT 1..." headers.

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

            // Check for Unit Header
            if (line.includes('UNIT') && (line.startsWith('🟦') || line.startsWith('🟩') || line.startsWith('🟧') || line.startsWith('🟨') || line.startsWith('🟪'))) {
                currentUnit = line.replace(/[🟦🟩🟧🟨🟪]/g, '').trim();
                console.log(`Processing Unit: ${currentUnit}`);
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

            // If strictly verified line, ignore
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

        console.log(`Found ${questions.length} questions.`);

        // Insert into DB
        // First, clear existing questions to avoid duplicates if re-running?
        // Maybe just insert.

        console.log('Inserting questions into database...');

        // Batch insert or loop
        for (const q of questions) {
            await sql`
                INSERT INTO questions (unit, question, options, answer)
                VALUES (${q.unit}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer})
            `;
        }

        console.log('Seed completed successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
