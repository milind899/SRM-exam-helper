
const puppeteer = require('puppeteer');

const SRM_LOGIN_URL = 'https://sp.srmist.edu.in/srmiststudentportal/';

// Global state to keep browser open between requests
let globalBrowser = null;
let globalPage = null;

async function getCaptcha() {
    console.log('Requesting Captcha...');

    // Close existing browser if any (start fresh)
    if (globalBrowser) {
        try {
            await globalBrowser.close();
        } catch (e) { console.error('Error closing old browser:', e); }
        globalBrowser = null;
        globalPage = null;
    }

    console.log('Launching new browser...');
    globalBrowser = await puppeteer.launch({
        headless: false, // Visible for debugging
        defaultViewport: null,
        args: ['--start-maximized']
    });

    try {
        globalPage = await globalBrowser.newPage();
        console.log(`Navigating to ${SRM_LOGIN_URL}...`);
        await globalPage.goto(SRM_LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for captcha image to load
        const captchaSelector = 'img[src*="captchas"]';

        try {
            await globalPage.waitForSelector(captchaSelector, { timeout: 5000 });
            // Wait for image to actually load
            await globalPage.waitForFunction(
                selector => {
                    const img = document.querySelector(selector);
                    return img && img.naturalWidth > 0;
                },
                { timeout: 5000 },
                captchaSelector
            );

            // Add a small delay to ensure rendering
            await new Promise(r => setTimeout(r, 1000));

        } catch (e) {
            console.log('Captcha wait failed:', e.message);
        }

        // Get cookies
        const cookies = await globalPage.cookies();

        // Take screenshot of the captcha element (or parent to be safe)
        const captchaElement = await globalPage.$(captchaSelector);
        let captchaImage;

        if (captchaElement) {
            // Try to get parent if possible, otherwise element itself
            const parent = await captchaElement.evaluateHandle(el => el.parentElement);
            if (parent) {
                captchaImage = await parent.screenshot({ encoding: 'base64' });
            } else {
                captchaImage = await captchaElement.screenshot({ encoding: 'base64' });
            }
        } else {
            console.warn('Captcha element not found! Taking full page screenshot for debug.');
            captchaImage = await globalPage.screenshot({ encoding: 'base64' });
        }

        // IMPORTANT: Do NOT close browser here. We need it for login.

        return {
            success: true,
            captchaImage: `data: image / png; base64, ${captchaImage} `,
            cookies
        };

    } catch (error) {
        console.error('Error in getCaptcha:', error);
        if (globalBrowser) await globalBrowser.close();
        return { success: false, error: error.message };
    }
}

async function loginAndFetchAttendance(credentials) {
    console.log('Starting login process...');

    if (!globalPage || !globalBrowser) {
        return { success: false, error: "Session expired. Please refresh captcha." };
    }

    try {
        const page = globalPage;

        // Wait for form (should be there already)
        await page.waitForSelector('#login', { timeout: 5000 });

        // Type credentials
        console.log('Entering credentials...');

        // Clear fields first just in case
        await page.evaluate(() => {
            document.querySelector('#login').value = '';
            document.querySelector('#passwd').value = '';
            document.querySelector('#ccode').value = '';
        });

        await page.type('#login', credentials.netId);
        await page.type('#passwd', credentials.password);
        await page.type('#ccode', credentials.captchaText);

        // Click Login
        console.log('Clicking login...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
            page.click('.btn-custom')
        ]);

        const pageContent = await page.content();
        if (pageContent.includes('Invalid') || pageContent.includes('Wrong')) {
            throw new Error('Login failed: Invalid credentials or captcha');
        }

        console.log('Login successful! Navigating to attendance page...');

        // Navigate to attendance page by clicking the menu item
        // Direct navigation fails because it requires form submission with specific ID
        console.log('Navigating to Attendance Details...');

        try {
            await page.waitForSelector('#listId9', { timeout: 10000, visible: true });
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
                page.click('#listId9')
            ]);
        } catch (navError) {
            console.error('Menu navigation failed, trying direct form submission fallback...');
            // Fallback: Execute the script directly if click fails
            await page.evaluate(() => {
                if (typeof funSetFormId === 'function') {
                    funSetFormId(9);
                }
            });
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
        }

        console.log('Attendance page loaded. Scraping data...');

        // Wait for any table to load
        await page.waitForSelector('table', { timeout: 10000 });

        const attendanceData = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            let targetTable = null;
            let headerRow = null;

            // Find the table that looks like an attendance table
            for (const table of tables) {
                const rows = Array.from(table.querySelectorAll('tr'));
                for (const row of rows) {
                    const text = row.innerText.toLowerCase();
                    // Match standard table OR percentage-only table (Code, Description, Total Percentage)
                    if (text.includes('code') && (text.includes('title') || text.includes('description'))) {
                        targetTable = table;
                        headerRow = row;
                        break;
                    }
                }
                if (targetTable) break;
            }

            if (!targetTable) return { error: "Attendance table not found" };

            // Map column indices
            const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
            const headerIndices = {};

            headerCells.forEach((cell, index) => {
                const headerText = cell.innerText.trim().toLowerCase();
                if (headerText.includes('code')) headerIndices.code = index;
                else if (headerText.includes('description') || headerText.includes('course title') || headerText.includes('name') || headerText.includes('title')) headerIndices.name = index;
                else if (headerText.includes('max. hours') || headerText.includes('total hours') || headerText.includes('conducted') || (headerText.includes('total') && !headerText.includes('percentage'))) headerIndices.total = index;
                else if (headerText.includes('att. hours') || headerText.includes('attended hours') || headerText.includes('attended') || headerText.includes('present')) headerIndices.attended = index;
                else if (headerText.includes('absent hours') || headerText.includes('absent')) headerIndices.absent = index;
                else if (headerText.includes('total percentage') || headerText.includes('%') || headerText.includes('percentage')) headerIndices.percentage = index;
            });

            if (headerIndices.code === undefined || headerIndices.name === undefined) return { error: "Could not identify table columns" };

            const subjects = [];
            const rows = Array.from(targetTable.querySelectorAll('tr'));

            // Skip header row and footer row (if any)
            for (let i = 1; i < rows.length; i++) {
                const cells = Array.from(rows[i].querySelectorAll('td'));
                if (cells.length < 3) continue;

                // Check if it's a total row
                if (cells[0].innerText.toLowerCase().includes('total')) continue;

                const code = cells[headerIndices.code]?.innerText.trim();
                const name = cells[headerIndices.name]?.innerText.trim();

                // Extract values using mapped indices
                const total = headerIndices.total !== undefined ? cells[headerIndices.total]?.innerText.trim() : '0';
                const attended = headerIndices.attended !== undefined ? cells[headerIndices.attended]?.innerText.trim() : '0';
                const absent = headerIndices.absent !== undefined ? cells[headerIndices.absent]?.innerText.trim() : '0';
                const percentage = headerIndices.percentage !== undefined ? cells[headerIndices.percentage]?.innerText.trim() : '0';

                if (code && name) {
                    subjects.push({
                        code,
                        name,
                        total: total.toString(),
                        attended: attended.toString(),
                        absent: absent.toString(),
                        percentage: percentage.toString()
                    });
                }
            }

            return subjects;
        });

        if (attendanceData.error) {
            console.error('Scraping error:', attendanceData.error);
            // Dump HTML for debugging
            const fs = require('fs');
            const html = await page.content();
            fs.writeFileSync('debug_dashboard.html', html);
            console.log('Dumped page HTML to debug_dashboard.html');
        }

        console.log(`Scraped ${Array.isArray(attendanceData) ? attendanceData.length : 0} subjects.`);

        // --- Start Internal Marks Scraping ---
        console.log('Navigating to Internal Marks (#listId13)...');
        let marksData = [];

        // Handle alerts
        page.on('dialog', async dialog => {
            console.log('Alert dialog detected:', dialog.message());
            await dialog.dismiss();
        });

        // Log browser console messages
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        try {
            await page.waitForSelector('#listId13', { timeout: 5000, visible: true });
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
                page.click('#listId13')
            ]);

            console.log('Internal Marks page loaded. Waiting for content...');

            // Wait for loading gif to disappear
            try {
                await page.waitForSelector('img[src*="wait.gif"]', { hidden: true, timeout: 10000 });
            } catch (e) {
                console.log('Warning: Loading gif did not disappear or was not found.');
            }

            // Try to wait for table, if fails, try manual injection
            try {
                await page.waitForSelector('table', { timeout: 10000 });
            } catch (e) {
                console.log('Table not found, trying manual injection of funShow...');
                await page.evaluate(() => {
                    if (typeof funShow === 'function') {
                        funShow(13, '../../students/report/studentInternalMarkDetails.jsp');
                    }
                });
                await page.waitForSelector('table', { timeout: 15000 });
            }

            // DEBUG: Dump HTML AFTER waiting
            const fs = require('fs');
            const html = await page.content();
            fs.writeFileSync('debug_marks.html', html);
            console.log('Dumped marks page HTML to debug_marks.html');

            // Scrape the main table to get subjects and their IDs for fetching details
            const subjects = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.table-billing-history table tr'));

                // Skip header
                return rows.slice(1).map((row, index) => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length < 3) return null;

                    const rawMark = cells[2]?.innerText.trim();
                    const totalMark = rawMark ? rawMark.split('/')[0].trim() : '-';

                    // Extract subject ID from the "View Details" button onclick attribute
                    // Format: funViewComponentWiseMarks('53819', 'UBA23501T', ...)
                    const button = row.querySelector('button, a');
                    let subjectId = null;
                    if (button) {
                        const onclick = button.getAttribute('onclick');
                        if (onclick) {
                            const match = onclick.match(/'(\d+)'/);
                            if (match) subjectId = match[1];
                        }
                    }

                    return {
                        code: cells[0]?.innerText.trim(),
                        name: cells[1]?.innerText.trim(),
                        totalMark: totalMark,
                        subjectId: subjectId
                    };
                }).filter(s => s && s.code && s.subjectId);
            });

            console.log(`Found ${subjects.length} subjects. Fetching details in parallel...`);

            // Fetch details for all subjects in parallel using the page context
            const detailedMarks = await page.evaluate(async (subjects) => {
                const fetchSubjectDetails = (subject) => {
                    return new Promise((resolve) => {
                        // Replicate the website's AJAX call
                        const appURL = "../../students/report/studentInternalMarkDetailsInner.jsp";
                        const appParameter = [
                            { name: "iden", value: 1 },
                            { name: "hdnSubjectId", value: subject.subjectId },
                            { name: "status", value: 1 }
                        ];

                        $.post(appURL, appParameter, function (data) {
                            // Parse the returned HTML (which is a table)
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(data, 'text/html');
                            const rows = Array.from(doc.querySelectorAll('tr'));

                            const details = {
                                code: subject.code,
                                name: subject.name,
                                total: subject.totalMark,
                                cla1: '-', cla2: '-', cla3: '-', cla4: '-', assignment: '-'
                            };

                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td');
                                if (cells.length >= 3) {
                                    const component = cells[1].innerText.trim(); // e.g. "Theory CLA1"
                                    const mark = cells[2].innerText.trim().split('/')[0].trim(); // e.g. "8.00"

                                    if (component.includes('CLA1')) details.cla1 = mark;
                                    else if (component.includes('CLA2')) details.cla2 = mark;
                                    else if (component.includes('CLA3')) details.cla3 = mark;
                                    else if (component.includes('CLA4')) details.cla4 = mark;
                                    else if (component.includes('Assignment') || component.includes('CLA5')) details.assignment = mark;
                                }
                            });
                            resolve(details);
                        }).fail(() => {
                            resolve({
                                code: subject.code,
                                name: subject.name,
                                total: subject.totalMark,
                                error: true
                            });
                        });
                    });
                };

                // Execute all requests in parallel
                return Promise.all(subjects.map(fetchSubjectDetails));
            }, subjects);

            marksData = detailedMarks;
            console.log(`Scraped ${marksData.length} marks records successfully.`);

        } catch (e) {
            console.error('Error scraping marks:', e.message);
            // Don't fail the whole login if marks fail, just return empty
        }
        // --- End Internal Marks Scraping ---

        // Close browser after successful login
        await globalBrowser.close();
        globalBrowser = null;
        globalPage = null;

        return {
            success: true,
            attendance: Array.isArray(attendanceData) ? attendanceData : [],
            marks: marksData
        };

    } catch (error) {
        console.error('Error in login:', error);
        // Don't close browser on error immediately, let user try again? 
        // Actually, usually better to close and force retry.
        if (globalBrowser) await globalBrowser.close();
        globalBrowser = null;
        globalPage = null;
        return { success: false, error: error.message };
    }
}

module.exports = {
    getCaptcha,
    loginAndFetchAttendance
};
