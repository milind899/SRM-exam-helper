import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function checkDb() {
    try {
        const questionsCount = await sql`SELECT COUNT(*) FROM questions`;
        console.log('Questions count:', questionsCount[0].count);

        const leaderboardCount = await sql`SELECT COUNT(*) FROM leaderboard`;
        console.log('Leaderboard count:', leaderboardCount[0].count);

        const sampleQuestion = await sql`SELECT * FROM questions LIMIT 1`;
        console.log('Sample Question:', sampleQuestion[0]);

    } catch (error) {
        console.error('Error checking DB:', error);
    }
}

checkDb();
