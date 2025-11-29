const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'SRM Zen Backend is running',
        timestamp: new Date().toISOString()
    });
});

const crawler = require('./crawler');

// API Routes

// 1. Get Captcha
app.get('/api/crawl/captcha', async (req, res) => {
    console.log('Request received: GET /api/crawl/captcha');
    try {
        const result = await crawler.getCaptcha();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Login & Fetch Attendance
app.post('/api/crawl/login', async (req, res) => {
    console.log('Request received: POST /api/crawl/login');
    const { netId, password, captchaText, cookies } = req.body;

    if (!netId || !password || !captchaText || !cookies) {
        return res.status(400).json({ success: false, error: 'Missing credentials or captcha' });
    }

    try {
        const result = await crawler.loginAndFetchAttendance({ netId, password, captchaText, cookies });
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result); // 401 for login failure
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
