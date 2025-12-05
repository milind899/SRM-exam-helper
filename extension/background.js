// Listen for messages from the Dashboard Bridge
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_DATA") {
        handleSync(sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleSync(sendResponse) {
    try {
        // Find the SRM Portal tab
        const tabs = await chrome.tabs.query({ url: ["*://sp.srmist.edu.in/*", "*://academia.srmist.edu.in/*"] });

        if (tabs.length === 0) {
            sendResponse({ success: false, error: "SRM Portal is not open. Please open it and log in." });
            return;
        }

        const srmTab = tabs[0];

        // 1. Try to PING the content script to see if it's already running
        try {
            await sendMessageToTab(srmTab.id, { action: "PING" });
            console.log("Content script is alive. Proceeding to scrape.");
        } catch (e) {
            console.log("Content script not responding. Injecting it now...", e);

            // 2. Inject the script if PING failed
            await chrome.scripting.executeScript({
                target: { tabId: srmTab.id },
                files: ["srm-scraper.js"]
            });

            // Wait a moment for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 3. Request Data Scraping
        const response = await sendMessageToTab(srmTab.id, { action: "SCRAPE_ALL" });
        sendResponse(response);

    } catch (error) {
        console.error("Sync Error:", error);
        sendResponse({ success: false, error: error.message || "Unknown error occurred during sync." });
    }
}

// Helper to wrap chrome.tabs.sendMessage in a Promise
function sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}
