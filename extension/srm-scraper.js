// This script runs on the SRM Portal page

try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "PING") {
                sendResponse({ success: true, status: "alive" });
                return true;
            }
            if (request.action === "SCRAPE_ALL") {
                scrapeAllData().then(data => sendResponse({ success: true, data })).catch(err => sendResponse({ success: false, error: err.message }));
                return true;
            }
        });
    }
} catch (e) {
    console.warn("SRM Scraper: Failed to initialize chrome runtime listener (this is expected in web mode)", e);
}

// 4. Scrape Student Profile (from Attendance page doc)
// We can extract this from the header of the attendance page we already fetched
let userProfile = null;


// Refactored Scrape Flow to reuse documents

async function scrapeAllData() {
    try {
        // A. Attendance & Profile
        let attendanceDoc = document; // Default to current
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentAttendanceDetails.jsp');
            if (response.ok) {
                const text = await response.text();
                attendanceDoc = new DOMParser().parseFromString(text, 'text/html');
            }
        } catch (e) { console.error("Error fetching attendance doc:", e); }

        const attendance = scrapeAttendanceFromDocument(attendanceDoc);
        userProfile = scrapeUserProfile(attendanceDoc);

        // A.1. Detailed Attendance (NEW)
        // Try to fetch detailed logs for each subject
        for (const subject of attendance) {
            if (subject.subjectId) {
                console.log("Fetching details for subject:", subject.name);
                const details = await scrapeAttendanceDetails(subject.subjectId);
                subject.logs = details; // Attach logs to the subject
            }
        }

        // B. Marks
        let marksDoc = document;
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentInternalMarkDetails.jsp');
            if (response.ok) {
                const text = await response.text();
                marksDoc = new DOMParser().parseFromString(text, 'text/html');
            }
        } catch (e) { console.error("Error fetching marks doc:", e); }
        const marksData = await scrapeMarks(marksDoc);

        // C. Timetable
        let timetable = [];
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentTimeTable.jsp');
            if (response.ok) {
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                timetable = scrapeTimetable(doc);
            }
        } catch (e) { console.error("Error fetching timetable:", e); }

        // D. Exam Schedule
        let examSchedule = [];
        try {
            const response = await fetch('/srmiststudentportal/students/report/studentExamSchedule.jsp');
            if (response.ok) {
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                examSchedule = scrapeExamSchedule(doc);
            }
        } catch (e) { console.error("Error fetching exam schedule:", e); }

        // E. Academic History (Grades)
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
            academicHistory
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

    // Look for standard header info
    // Usually in tables with class 'table-info' or just text nodes
    const text = doc.body.innerText;

    // Regex patterns for common labels
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

function scrapeExamSchedule(doc) {
    const exams = [];
    const tables = Array.from(doc.querySelectorAll('table'));

    // Find table with "Date" and "Session"
    const targetTable = tables.find(t => {
        const text = t.innerText.toLowerCase();
        return text.includes('date') && text.includes('session') && text.includes('course');
    });

    if (targetTable) {
        const rows = Array.from(targetTable.querySelectorAll('tr'));
        // Skip header
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

    // Find table with "Semester" and "SGPA"
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
    const rows = Array.from(doc.querySelectorAll('.table-billing-history table tr'));

    const subjectsToFetch = [];

    // 1. Parse the main marks table to get Subject IDs
    rows.slice(1).forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;

        const code = cells[0]?.innerText.trim();
        const name = cells[1]?.innerText.trim();
        const rawMark = cells[2]?.innerText.trim();
        const totalMark = rawMark ? rawMark.split('/')[0].trim() : '-';

        // Extract ID
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
            subjectsToFetch.push({ code, name, totalMark, subjectId });
        }
    });

    // 2. Fetch details for each subject in parallel
    const promises = subjectsToFetch.map(async (subject) => {
        try {
            const formData = new URLSearchParams();
            formData.append('iden', '1');
            formData.append('hdnSubjectId', subject.subjectId);
            formData.append('status', '1');

            const response = await fetch('/srmiststudentportal/students/report/studentInternalMarkDetailsInner.jsp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const html = await response.text();
            const parser = new DOMParser();
            const detailDoc = parser.parseFromString(html, 'text/html');
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
            console.error("Error fetching details for", subject.code, e);
            return { code: subject.code, name: subject.name, total: subject.totalMark, error: true };
        }
    });

    return Promise.all(promises);
}

function scrapeAttendanceFromDocument(doc) {
    const subjects = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    let targetTable = null;

    // 1. Find the Attendance Table
    for (const table of tables) {
        const text = table.innerText.toLowerCase();
        // Look for standard attendance table headers
        if (text.includes('code') && (text.includes('title') || text.includes('description') || text.includes('max. hours'))) {
            targetTable = table;
            break;
        }
    }

    if (targetTable) {
        const rows = Array.from(targetTable.querySelectorAll('tr'));

        // 2. Identify Columns Dynamically
        let headers = [];
        let headerRowIndex = 0;

        // Try to find the header row (row with 'code' or 'subject')
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
            if (rows[i].innerText.toLowerCase().includes('code')) {
                headers = Array.from(rows[i].querySelectorAll('td, th'));
                headerRowIndex = i;
                break;
            }
        }

        // Default indices (Standard SRM format)
        // Based on screenshot: Code(0), Desc(1), Max(2), Att(3), Abs(4), Avg%(5), OD%(6), Tot%(7)
        let indices = {
            code: 0,
            name: 1,
            category: -1, // Not present in this layout
            total: 2,     // Max. hours
            attended: 3,  // Att. hours
            absent: 4,    // Absent hours
            percentage: 7 // Total Percentage
        };

        // Map headers to indices if found
        if (headers.length > 0) {
            console.log("Found headers:", headers.map(h => h.innerText));
            // Reset indices to -1 to ensure we only use found ones or fallbacks
            indices = { code: -1, name: -1, category: -1, total: -1, attended: -1, absent: -1, percentage: -1 };

            headers.forEach((header, index) => {
                const text = header.innerText.toLowerCase();
                if (text.includes('code')) indices.code = index;
                else if (text.includes('title') || text.includes('description') || text.includes('name')) indices.name = index;
                else if (text.includes('category')) indices.category = index;
                // Be careful not to match "Attended Hours" as "Hours" (Total)
                else if (text.includes('max') || text.includes('conducted') || (text.includes('total') && !text.includes('att') && !text.includes('perc'))) indices.total = index;
                else if (text.includes('att') || text.includes('present')) indices.attended = index;
                else if (text.includes('absent') || text.includes('leave')) indices.absent = index;
                else if (text.includes('total percentage')) indices.percentage = index; // Prioritize "Total Percentage"
                else if ((text.includes('%') || text.includes('percentage')) && indices.percentage === -1) indices.percentage = index;
            });

            // Fallback if dynamic detection missed critical columns but we have a known structure (8 cols)
            if (headers.length >= 8 && indices.total === -1) {
                // Assume the screenshot layout if we have enough columns but failed to match "Max"
                if (indices.code === 0) {
                    indices.total = 2;
                    indices.attended = 3;
                    indices.absent = 4;
                    indices.percentage = 7;
                }
            }
            console.log("Resolved indices:", indices);
        }

        // 3. Extract Data
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            // Ensure we have enough cells and it's not a "Total" summary row
            if (cells.length >= 5 && !cells[0].innerText.toLowerCase().includes('total')) {
                const code = indices.code > -1 ? cells[indices.code]?.innerText.trim() : '';
                const name = indices.name > -1 ? cells[indices.name]?.innerText.trim() : '';

                // Parse numbers carefully (remove non-numeric chars)
                const totalText = indices.total > -1 ? cells[indices.total]?.innerText.trim() : '0';
                const attendedText = indices.attended > -1 ? cells[indices.attended]?.innerText.trim() : '0';
                const absentText = indices.absent > -1 ? cells[indices.absent]?.innerText.trim() : '0';
                const percentageText = indices.percentage > -1 ? cells[indices.percentage]?.innerText.trim() : '0';

                // Use parseFloat for percentage to ensure we handle decimals
                let total = parseInt(totalText.replace(/\D/g, '')) || 0;
                let attended = parseInt(attendedText.replace(/\D/g, '')) || 0;
                const absent = parseInt(absentText.replace(/\D/g, '')) || 0;

                // CORRECTION LOGIC:
                // If Attended == Total (100%) but Absent > 0, then Attended is likely wrong (pointing to Total column)
                // or Total is wrong.
                // Usually Total = Attended + Absent.
                // If Scraped Total == Scraped Attended, and Absent > 0, then likely Scraped Attended is actually Total.
                // So Real Attended = Scraped Total - Absent.
                if (total > 0 && attended === total && absent > 0) {
                    console.warn(`Correcting attendance for ${code}: Total=${total}, Attended=${attended} -> ${total - absent}, Absent=${absent}`);
                    attended = total - absent;
                }

                // Also, if Total < Attended, something is wrong.
                if (total < attended) {
                    // Maybe swapped?
                    if (total === absent && attended > total) {
                        // Weird case, just swap? No, unsafe.
                    }
                }

                if (code && name) {
                    code,
                        name,
                        total,
                        attended,
                        percentage: percentageText,
                            subjectId: null // Placeholder
                };

                // Try to find subjectId (onClick or hidden input)
                // Check for a link/button in the row
                const actionCell = cells[0]; // Often the Code is a link
                const link = actionCell.querySelector('a, button') || row.querySelector('a[onclick], button[onclick]');
                if (link) {
                    const onclick = link.getAttribute('onclick');
                    // Pattern: viewDetails('12345') or similar
                    if (onclick) {
                        const match = onclick.match(/'(\d+)'/);
                        if (match) subject.subjectId = match[1];
                    }
                }

                if (subject.code && subject.name) subjects.push(subject);
            }
        }
    }
}
return subjects;
}

async function scrapeAttendanceDetails(subjectId) {
    const logs = [];
    try {
        const formData = new URLSearchParams();
        formData.append('iden', '1'); // Common SRM param
        formData.append('hdnSubjectId', subjectId);

        // Guessed URL based on Marks pattern
        const response = await fetch('/srmiststudentportal/students/report/studentAttendanceDetailsInner.jsp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!response.ok) return [];

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr'));

        // Parse detailed rows
        // Expected columns: S.No, Date, Hour/Period, Status (Present/Absent), etc.
        rows.slice(1).forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const dateRaw = cells[1]?.innerText.trim(); // e.g., 05-Dec-2023
                const hourRaw = cells[2]?.innerText.trim(); // e.g., Hour 1
                const statusRaw = cells[3]?.innerText.trim(); // e.g., Present

                if (dateRaw && statusRaw) {
                    logs.push({
                        date: dateRaw,
                        slot: hourRaw || 'Unknown',
                        status: statusRaw.includes('Present') ? 'Present' :
                            statusRaw.includes('Absent') ? 'Absent' :
                                statusRaw.includes('OD') ? 'On Duty' : 'Cancelled'
                    });
                }
            }
        });
    } catch (e) {
        console.warn("Failed to scrape details for subjectId:", subjectId, e);
    }
    return logs;
}

function scrapeTimetable(doc) {
    const timetable = [];
    const tables = Array.from(doc.querySelectorAll('table'));
    let targetTable = null;

    // 1. Find the Timetable
    // Strategy A: Look for "Day Order"
    for (const table of tables) {
        if (table.innerText.toLowerCase().includes('day order')) {
            targetTable = table;
            break;
        }
    }

    // Strategy B: Look for "Day 1" ... "Day 5" pattern if Strategy A fails
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

        // 2. Parse Header for Time Slots
        let headerRow = null;
        const timeSlots = [];

        // Find header row: Look for a row with time patterns (e.g., "08:00", "8:00", "-")
        for (const row of rows) {
            if (row.innerText.includes(':') && (row.innerText.includes('08') || row.innerText.includes('8'))) {
                headerRow = row;
                break;
            }
        }

        if (headerRow) {
            const cells = headerRow.querySelectorAll('td, th');
            // Skip first cell (usually "Day Order" label)
            for (let i = 1; i < cells.length; i++) {
                timeSlots.push(cells[i].innerText.trim());
            }
        }

        // 3. Parse Data Rows
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const firstCell = cells[0]?.innerText.trim();

            // Check if it's a Day row (e.g., "Day 1")
            if (firstCell && firstCell.toLowerCase().includes('day')) {
                const day = firstCell;

                // Iterate through time slots
                for (let i = 1; i < cells.length; i++) {
                    const subject = cells[i]?.innerText.trim();
                    const time = timeSlots[i - 1] || `Slot ${i}`; // Fallback if header parsing failed

                    // Ignore empty cells or "-"
                    if (subject && subject !== '-' && subject.length > 1) {
                        timetable.push({
                            day: day,
                            period: `Slot ${i}`,
                            time: time,
                            subject: subject,
                            room: ''
                        });
                    }
                }
            }
        }
    }

    return timetable;
}
