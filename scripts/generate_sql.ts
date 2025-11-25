import fs from 'fs';
import path from 'path';
import questionsData from '../api/questions_data.json';

async function generateSql() {
    try {
        console.log('Generating SQL file...');

        let sqlContent = `
-- Create tables
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    unit VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_test_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data (optional, comment out if you want to append)
DELETE FROM questions;

-- Insert questions
`;

        for (const q of questionsData) {
            // Escape single quotes in question and answer
            const safeQuestion = q.question.replace(/'/g, "''");
            const safeAnswer = q.answer.replace(/'/g, "''");
            const safeOptions = JSON.stringify(q.options).replace(/'/g, "''");

            sqlContent += `INSERT INTO questions (unit, question, options, answer) VALUES ('${q.unit}', '${safeQuestion}', '${safeOptions}', '${safeAnswer}');\n`;
        }

        const outputPath = path.join(process.cwd(), 'seed.sql');
        fs.writeFileSync(outputPath, sqlContent);
        console.log(`SQL file generated at: ${outputPath}`);

    } catch (error) {
        console.error('Error generating SQL:', error);
    }
}

generateSql();
