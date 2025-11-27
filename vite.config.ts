import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SRM Exam Helper',
        short_name: 'Exam Helper',
        description: 'Track your exam preparation for SRM University subjects',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Helper to parse body
          const parseBody = async () => {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            return JSON.parse(Buffer.concat(buffers).toString());
          };

          // Helper to send JSON
          const sendJson = (data: any, status = 200) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          // Load DB connection
          const getSql = async () => {
            if (!process.env.DATABASE_URL) {
              const dotenv = await import('dotenv');
              dotenv.config();
            }
            if (!process.env.DATABASE_URL) return null;
            const { neon } = await import('@neondatabase/serverless');
            return neon(process.env.DATABASE_URL);
          };

          if (req.method === 'POST') {
            if (req.url === '/api/challenge/create') {
              try {
                const data = await parseBody();
                const sql = await getSql();
                if (!sql) return sendJson({ error: 'Database not configured' }, 500);

                const { creator_id, unit } = data;
                if (!creator_id || !unit) return sendJson({ error: 'Missing fields' }, 400);

                const questions = await sql`SELECT id FROM questions WHERE unit = ${unit} ORDER BY RANDOM() LIMIT 10`;
                if (questions.length === 0) return sendJson({ error: 'No questions found' }, 404);

                const challenge = await sql`
                  INSERT INTO challenges (creator_id, unit, question_ids, status)
                  VALUES (${creator_id}, ${unit}, ${JSON.stringify(questions.map(q => q.id))}, 'pending')
                  RETURNING id
                `;

                return sendJson({ success: true, challengeId: challenge[0].id });
              } catch (err: any) {
                console.error('API Error (Challenge Create):', err);
                return sendJson({ error: err.message || 'Internal Server Error' }, 500);
              }
            }

            if (req.url === '/api/submit_test') {
              try {
                const data = await parseBody();
                const sql = await getSql();
                if (!sql) return sendJson({ success: true, message: 'Saved locally (no DB)' });

                const { user_id, score, total_questions } = data;
                if (!user_id || score === undefined) return sendJson({ error: 'Missing fields' }, 400);

                await sql`INSERT INTO user_test_results (user_id, score, total_questions) VALUES (${user_id}, ${score}, ${total_questions})`;

                // Update leaderboard
                const existing = await sql`SELECT progress_data FROM leaderboard WHERE user_id = ${user_id}`;
                let currentData = existing[0]?.progress_data || {};
                const currentMax = currentData.cn_max_score || 0;

                if (score > currentMax) {
                  currentData.cn_max_score = score;
                  currentData.cn_total_questions = total_questions;

                  // Upsert leaderboard
                  const exists = existing.length > 0;
                  if (exists) {
                    await sql`UPDATE leaderboard SET progress_data = ${JSON.stringify(currentData)}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${user_id}`;
                  } else {
                    await sql`INSERT INTO leaderboard (user_id, progress_data) VALUES (${user_id}, ${JSON.stringify(currentData)})`;
                  }
                }

                return sendJson({ success: true, message: 'Score saved' });
              } catch (err: any) {
                console.error('API Error (Submit Test):', err);
                return sendJson({ success: true, message: 'Saved locally (DB error)', dbError: err.message }, 200);
              }
            }
          }

          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pomodoro: resolve(__dirname, 'pomodoro.html'),
      },
    },
  },

  server: {
    proxy: {
      // If we had a real backend, we'd proxy here.
      // Since we don't, we'll handle it in configureServer below.
    }
  },
})
