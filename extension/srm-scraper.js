// srm-scraper.js - Content Script
// Scrapes data from the SRM Student Portal

// Listen for messages from the extension background/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PING") {
        sendResponse({ status: "OK", url: window.location.href });
    } else if (request.action === "SCRAPE_ALL") {
        scrapeAllData().then(data => {
            sendResponse({ status: "SUCCESS", data: data });
        }).catch(err => {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            sendResponse({ status: "ERROR", error: msg || "Unknown Scraper Error" });
        });
        return true; // Keep channel open for async response
    }
});

// Helper to collect logs
const debugLogs = [];
function log(...args) {
    console.log("[SRM Scraper]", ...args);
    debugLogs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
}

async function scrapeAllData() {
    try {
        log("Scraping started...");
        const attendance = scrapeAttendanceFromDocument(document);
        const userProfile = scrapeUserProfile(document);
        const timetable = scrapeTimetable(document);

        // Fetch other pages if possible (optional enhancement)

        // A. Marks
        let marksData = [];
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentInternalMarks.jsp');
            if (response.ok) {
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                marksData = await scrapeMarks(doc);
            }
        } catch (e) { console.error("Error fetching marks:", e); }

        // B. Exam Schedule
        let examSchedule = [];
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentExamSchedule.jsp');
            if (response.ok) {
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                examSchedule = scrapeExamSchedule(doc);
            }
        } catch (e) { console.error("Error fetching exam schedule:", e); }

        // C. Academic History
        let academicHistory = [];
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentAcademicStatus.jsp');
            if (response.ok) {
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                academicHistory = scrapeAcademicHistory(doc);
            }
        } catch (e) { console.error("Error fetching academic history:", e); }

        return {
            attendance,
            marks: marksData,
            timetable,
            userProfile,
            examSchedule,
            academicHistory,
            logs: debugLogs
        };
    } catch (fatalError) {
        console.error("Fatal error in scrapeAllData:", fatalError);
        throw fatalError;
    }
}

function scrapeUserProfile(doc) {
    const profile = {
        name: '',
        regNo: '',
        branch: '',
        program: '',
        semester: '',
        section: ''
    };

    const text = doc.body.innerText;
    const nameMatch = text.match(/Name\s*[:\-]\s*([A-Za-z\s\.]+)/i);
    const regMatch = text.match(/Reg(?:ister)?\.?\s*No\s*[:\-]\s*([A-Za-z0-9]+)/i);
    const branchMatch = text.match(/Branch\s*[:\-]\s*([A-Za-z\s\-\&]+)/i);
    const programMatch = text.match(/Program\s*[:\-]\s*([A-Za-z\s\.]+)/i);

    if (nameMatch) profile.name = nameMatch[1].trim();
    if (regMatch) profile.regNo = regMatch[1].trim();
    if (branchMatch) profile.branch = branchMatch[1].trim();
    if (programMatch) profile.program = programMatch[1].trim();

    return profile;
}

function scrapeAttendanceFromDocument(doc) {
    log("Starting attendance scrape...");
    const subjects = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    let targetTable = null;

    // 1. Find the Attendance Table (Detailed)
    for (const table of tables) {
        const text = table.innerText.toLowerCase();
        if ((text.includes('code') || text.includes('course') || text.includes('subject')) &&
            (text.includes('present') || text.includes('attended') || text.includes('absent') || text.includes('max. hours'))) {
            targetTable = table;
            log("Found DETAILED attendance table:", table.rows[0]?.innerText.substring(0, 50) + "...");
            break;
        }
    }

    // 2. Fallback: Find Summary Table
    if (!targetTable) {
        log("Detailed table not found. Checking for Summary table...");
        for (const table of tables) {
            const text = table.innerText.toLowerCase();
            // Summary table usually has Code, Description, Total Percentage
            if (text.includes('course code') && text.includes('description') && text.includes('total percentage')) {
                // Double check it's not the detailed one
                targetTable = table;
                log("Found SUMMARY attendance table.");
                break;
            }
        }
    }

    if (!targetTable) {
        log("No attendance table found! Searched " + tables.length + " tables.");
        return subjects;
    }

    const rows = Array.from(targetTable.querySelectorAll('tr'));
    log("Table has " + rows.length + " rows.");

    // 3. Identify Columns Dynamically
    let indices = {
        code: -1,
        name: -1,
        total: -1,
        attended: -1,
        percentage: -1
    };

    let headerRowIndex = -1;

    // Find header row
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const text = rows[i].innerText.toLowerCase();
        if (text.includes('code') || text.includes('course') || text.includes('course code')) {
            headerRowIndex = i;
            log("Found header row at index " + i + ": " + text.substring(0, 100));

            const cells = rows[i].querySelectorAll('td, th');
            cells.forEach((cell, index) => {
                const hText = cell.innerText.toLowerCase();
                if (hText.includes('code')) indices.code = index;
                else if (hText.includes('title') || hText.includes('desc') || hText.includes('name')) indices.name = index;
                else if (hText.includes('max') || hText.includes('conducted') || (hText.includes('total') && !hText.includes('perc'))) indices.total = index;
                else if (hText.includes('att') || hText.includes('present')) indices.attended = index;
                else if (hText.includes('%') || hText.includes('percentage')) indices.percentage = index;
            });
            break;
        }
    }

    log("Resolved indices:", JSON.stringify(indices));

    if (indices.code === -1) indices.code = 0; // Optimistic fallback
    if (indices.name === -1) indices.name = 1;

    // 4. Extract Data
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length < 3) continue;

        const codeRaw = indices.code > -1 ? cells[indices.code]?.innerText.trim() : '';
        const nameRaw = indices.name > -1 ? cells[indices.name]?.innerText.trim() : '';

        // Skip junk rows
        if (!codeRaw || codeRaw.toLowerCase().includes('total') || codeRaw.length < 3) continue;

        const totalText = indices.total > -1 ? cells[indices.total]?.innerText.trim() : '0';
        const attendedText = indices.attended > -1 ? cells[indices.attended]?.innerText.trim() : '0';
        const percentageText = indices.percentage > -1 ? cells[indices.percentage]?.innerText.trim() : '0';

        const total = parseInt(totalText.replace(/\D/g, '')) || 0;
        const attended = parseInt(attendedText.replace(/\D/g, '')) || 0;
        const percentage = parseFloat(percentageText.replace(/[^\d.]/g, '')) || 0;

        subjects.push({
            code: codeRaw,
            name: nameRaw,
            total: total,
            attended: attended,
            scrapedPercentage: percentage // Log this!
        });
    }

    log("Extracted " + subjects.length + " subjects.");
    return subjects;
}

function scrapeTimetable(doc) {
    const timetable = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    let targetTable = null;

    // 1. Find the Timetable
    for (const table of tables) {
        if (table.innerText.toLowerCase().includes('day order')) {
            targetTable = table;
            break;
        }
    }

    if (!targetTable) {
        for (const table of tables) {
            const text = table.innerText.toLowerCase();
            if (text.includes('day 1') && text.includes('day 5')) {
                targetTable = table;
                break;
            }
        }
    }

    if (targetTable) {
        const rows = Array.from(targetTable.querySelectorAll('tr'));
        let headerRow = null;
        const timeSlots = [];

        // Find header row
        for (const row of rows) {
            if (row.innerText.includes(':') && (row.innerText.includes('08') || row.innerText.includes('8'))) {
                headerRow = row;
                break;
            }
        }

        if (headerRow) {
            const cells = headerRow.querySelectorAll('td, th');
            for (let i = 1; i < cells.length; i++) {
                timeSlots.push(cells[i].innerText.trim());
            }
        }

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;
            const firstCell = cells[0]?.innerText.trim();
            if (firstCell && firstCell.toLowerCase().includes('day')) {
                const day = firstCell;
                for (let i = 1; i < cells.length; i++) {
                    const subject = cells[i]?.innerText.trim();
                    const time = timeSlots[i - 1] || `Slot ${i}`;
                    if (subject && subject !== '-' && subject.length > 1) {
                        timetable.push({ day, period: `Slot ${i}`, time, subject, room: '' });
                    }
                }
            }
        }
    }
    return timetable;
}

function scrapeExamSchedule(doc) {
    const exams = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    const targetTable = tables.find(t => {
        const text = t.innerText.toLowerCase();
        return text.includes('date') && text.includes('session') && text.includes('course');
    });

    if (targetTable) {
        const rows = Array.from(targetTable.querySelectorAll('tr'));
        rows.slice(1).forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                exams.push({
                    code: cells[0]?.innerText.trim(),
                    name: cells[1]?.innerText.trim(),
                    date: cells[2]?.innerText.trim(),
                    session: cells[3]?.innerText.trim(),
                    venue: cells[4]?.innerText.trim() || ''
                });
            }
        });
    }
    return exams;
}

function scrapeAcademicHistory(doc) {
    const history = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    const targetTable = tables.find(t => {
        const text = t.innerText.toLowerCase();
        return text.includes('semester') && (text.includes('sgpa') || text.includes('gpa'));
    });

    if (targetTable) {
        const rows = Array.from(targetTable.querySelectorAll('tr'));
        rows.slice(1).forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                history.push({
                    semester: cells[0]?.innerText.trim(),
                    sgpa: cells[1]?.innerText.trim(),
                    cgpa: cells[2]?.innerText.trim()
                });
            }
        });
    }
    return history;
}

async function scrapeMarks(doc) {
    const marks = [];
    const rows = Array.from(doc.querySelectorAll('table tr'));
    const subjectsToFetch = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        const button = row.querySelector('button, a');
        let subjectId = null;
        if (button) {
            const onclick = button.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/'(\d+)'/);
                if (match) subjectId = match[1];
            }
        }
        if (subjectId) {
            subjectsToFetch.push({
                code: cells[0]?.innerText.trim(),
                name: cells[1]?.innerText.trim(),
                totalMark: cells[2]?.innerText.trim().split('/')[0].trim(),
                subjectId
            });
        }
    });

    // Limit parallelism
    const promises = subjectsToFetch.slice(0, 10).map(async (subject) => {
        try {
            const formData = new URLSearchParams();
            formData.append('iden', '1');
            formData.append('hdnSubjectId', subject.subjectId);
            formData.append('status', '1');

            // Use safeFetch with timeout to prevent hanging
            const response = await safeFetch('/srmiststudentportal/students/report/studentInternalMarkDetailsInner.jsp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            }, 8000); // 8 second timeout per subject

            if (!response.ok) throw new Error("Network response was not ok");

            const html = await response.text();
            const detailDoc = new DOMParser().parseFromString(html, 'text/html');
            const detailRows = Array.from(detailDoc.querySelectorAll('tr'));

            const details = {
                code: subject.code,
                name: subject.name,
                total: subject.totalMark,
                cla1: '-', cla2: '-', cla3: '-', cla4: '-', assignment: '-'
            };

            detailRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const component = cells[1].innerText.trim();
                    const mark = cells[2].innerText.trim().split('/')[0].trim();
                    if (component.includes('CLA1')) details.cla1 = mark;
                    else if (component.includes('CLA2')) details.cla2 = mark;
                    else if (component.includes('CLA3')) details.cla3 = mark;
                    else if (component.includes('CLA4')) details.cla4 = mark;
                    else if (component.includes('Assignment') || component.includes('CLA5')) details.assignment = mark;
                }
            });
            return details;
        } catch (e) {
            console.warn(`Failed to fetch marks for ${subject.code}:`, e);
            return { code: subject.code, error: true };
        }
    });
    return Promise.all(promises);
}

// Wrapper for fetch with timeout
async function safeFetch(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}
