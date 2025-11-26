const fs = require('fs');
const path = require('path');

// Read the text file
const filePath = path.join(__dirname, 'leaderboard', '🟦 UNIT 1 – INTRODUCTION, TOPOLOGIES, OSI MODEL, MEDIA.txt');
const content = fs.readFileSync(filePath, 'utf-8');

const questions = [];
let currentUnit = '';
let questionId = 1;

// Split by lines
const lines = content.split('\n').map(line => line.trim());

// Unit markers (emoji headers)
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
        const options = {};
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

// Write to JSON file
const outputPath = path.join(__dirname, 'questions_data.json');
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));

console.log(`Successfully parsed ${questions.length} questions to ${outputPath}`);
