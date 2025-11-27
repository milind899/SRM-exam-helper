const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'questions.json');

try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    if (!Array.isArray(json.questions)) {
        console.error('Error: "questions" is not an array');
        process.exit(1);
    }

    console.log(`Found ${json.questions.length} questions.`);

    let errors = 0;
    json.questions.forEach((q, index) => {
        if (!q.id) {
            console.error(`Question at index ${index} missing id`);
            errors++;
        }
        if (!q.unit) {
            console.error(`Question ${q.id} missing unit`);
            errors++;
        }
        if (!q.question) {
            console.error(`Question ${q.id} missing question text`);
            errors++;
        }
        if (!q.options || typeof q.options !== 'object') {
            console.error(`Question ${q.id} missing options or invalid format`);
            errors++;
        }
        if (!q.answer) {
            console.error(`Question ${q.id} missing answer`);
            errors++;
        }
    });

    if (errors === 0) {
        console.log('Validation passed! All questions have required fields.');
    } else {
        console.error(`Found ${errors} errors.`);
        process.exit(1);
    }

} catch (err) {
    console.error('Failed to read or parse questions.json:', err);
    process.exit(1);
}
