import fs from 'fs';
import path from 'path';

async function generateJson() {
    try {
        console.log('Starting JSON generation...');

        const filePath = path.join(process.cwd(), 'api', 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
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

            if (line.includes('UNIT') && (line.startsWith('🟦') || line.startsWith('🟩') || line.startsWith('🟧') || line.startsWith('🟨') || line.startsWith('🟪'))) {
                currentUnit = line.replace(/[🟦🟩🟧🟨🟪]/g, '').trim();
                continue;
            }

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

            const optionMatch = line.match(/^\(([A-D])\)\s+(.*)/);
            if (optionMatch) {
                isCollectingQuestion = false;
                currentOptions[optionMatch[1]] = optionMatch[2];
                continue;
            }

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

        if (currentQuestion && Object.keys(currentOptions).length > 0 && currentAnswer) {
            questions.push({
                unit: currentUnit,
                question: currentQuestion,
                options: currentOptions,
                answer: currentAnswer
            });
        }

        console.log(`Found ${questions.length} questions.`);

        const outputPath = path.join(process.cwd(), 'api', 'questions_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
        console.log(`JSON written to ${outputPath}`);

    } catch (error) {
        console.error('Error generating JSON:', error);
    }
}

generateJson();
