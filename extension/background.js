// Listen for messages from the Dashboard Bridge
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_DATA") {
        handleSync(sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleSync(sendResponse) {
    try {
        // Find the SRM Portal tab - Broadened search
        const tabs = await chrome.tabs.query({ url: ["*://sp.srmist.edu.in/*", "*://academia.srmist.edu.in/*", "*://*.srmist.edu.in/*"] });

        if (tabs.length === 0) {
            sendResponse({ success: false, error: "SRM Portal tab not found. Please open sp.srmist.edu.in and log in." });
            return;
        }

        const srmTab = tabs[0];

        // 1. Try to PING the content script to see if it's already running
        try {
            await sendMessageToTab(srmTab.id, { action: "PING" }, 2000); // Fast ping (2s)
            console.log("Content script is alive. Proceeding to scrape.");
        } catch (e) {
            console.log("Content script not responding. Injecting it now...", e);

            // 2. Inject the script if PING failed
            // Use 'scripting' API properly
            await chrome.scripting.executeScript({
                target: { tabId: srmTab.id },
                files: ["srm-scraper.js"]
            });

            // Wait a moment for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 3. Request Data Scraping with Safety Timeout
        // pass a longer timeout (e.g. 40s) so we beat the frontend timeout (45s)
        const response = await sendMessageToTab(srmTab.id, { action: "SCRAPE_ALL" }, 40000);
        sendResponse(response);

    } catch (error) {
        console.error("Sync Error:", error);
        sendResponse({ success: false, error: error.message || "Unknown error occurred during sync." });
    }
}

// Helper to wrap chrome.tabs.sendMessage in a Promise with Timeout
function sendMessageToTab(tabId, message, timeout = null) {
    return new Promise((resolve, reject) => {
        let timer = null;
        if (timeout) {
            timer = setTimeout(() => {
                reject(new Error("Timeout waiting for tab response"));
            }, timeout);
        }

        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (timer) clearTimeout(timer);
            if (chrome.runtime.lastError) {
                // Determine if it's a closed port or actual error
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}
