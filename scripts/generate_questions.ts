import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the text file
// Use process.cwd() to be safe
const inputPath = join(process.cwd(), 'api/leaderboard/🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
// Path to output JSON
const outputPath = join(process.cwd(), 'public/questions.json');

console.log(`Current directory: ${process.cwd()}`);
console.log(`Reading from: ${inputPath}`);
console.log(`Writing to: ${outputPath}`);

if (!existsSync(inputPath)) {
    console.error(`ERROR: Input file not found at ${inputPath}`);
    process.exit(1);
}


try {
    const content = readFileSync(inputPath, 'utf-8');
    const questions = [];
    let currentUnit = '';
    let questionId = 1;

    const lines = content.split('\n').map(line => line.trim());

    const unitMarkers = {
        '🟦': 'UNIT 1',
        '🟩': 'UNIT 2',
        '🟧': 'UNIT 3',
        '🟨': 'UNIT 4',
        '🟪': 'UNIT 5'
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Skip empty lines
        if (!line) {
            i++;
            continue;
        }

        // Check for unit headers
        let foundUnit = false;
        for (const [emoji, unitName] of Object.entries(unitMarkers)) {
            if (line.includes(emoji)) {
                currentUnit = unitName;
                console.log(`Found unit: ${currentUnit}`);
                foundUnit = true;
                break;
            }
        }
        if (foundUnit) {
            i++;
            continue;
        }

        // Check for question start (e.g., "1. ", "2. ", etc.)
        // Regex: Start of line, digits, dot, whitespace, anything
        const questionMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (questionMatch && currentUnit) {
            const questionText = questionMatch[2].trim();
            const options: Record<string, string> = {};
            let answer = '';

            // console.log(`Found question ${questionMatch[1]}: ${questionText.substring(0, 20)}...`);

            // Move to next line and collect options
            i++;
            while (i < lines.length) {
                const optionLine = lines[i];

                if (!optionLine) {
                    i++;
                    continue;
                }

                // Check for option (A), (B), (C), (D)
                const optionMatch = optionLine.match(/^\(([A-D])\)\s+(.+)/);
                if (optionMatch) {
                    const [, key, value] = optionMatch;
                    options[key] = value.trim();
                    i++;
                    continue;
                }

                // Check for answer line
                if (optionLine.startsWith('Answer:')) {
                    answer = optionLine.replace('Answer:', '').trim();
                    // console.log(`Found answer: ${answer}`);
                    break;
                }

                // If we hit next question (digits followed by dot), break
                if (optionLine.match(/^(\d+)\.\s+/)) {
                    // Don't increment i here, let the outer loop handle it
                    break;
                }

                // If we hit a unit header, break
                let isUnit = false;
                for (const emoji of Object.keys(unitMarkers)) {
                    if (optionLine.includes(emoji)) {
                        isUnit = true;
                        break;
                    }
                }
                if (isUnit) break;

                i++;
            }

            if (Object.keys(options).length >= 2 && answer) {
                questions.push({
                    id: questionId++,
                    unit: currentUnit,
                    question: questionText,
                    options,
                    answer
                });
            } else {
                console.warn(`Skipping incomplete question: ${questionText.substring(0, 30)}... Options: ${Object.keys(options).length}, Answer: ${!!answer}`);
            }
        } else {
            i++;
        }
    }


    // Ensure public dir exists
    const publicDir = dirname(outputPath);
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
    }

    writeFileSync(outputPath, JSON.stringify({ questions }, null, 2));
    console.log(`Successfully generated ${questions.length} questions to ${outputPath}`);

} catch (error) {
    console.error('Error generating questions:', error);
    process.exit(1);
}
