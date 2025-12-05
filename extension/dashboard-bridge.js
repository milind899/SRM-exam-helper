// This script runs on the Localhost Dashboard
// It listens for window messages from the React app and forwards them to the extension background script

// Inject a marker to let the React app know the extension is installed
const marker = document.createElement('div');
marker.id = 'srm-zen-bridge-installed';
marker.style.display = 'none';
document.body.appendChild(marker);
console.log("SRM Zen Bridge: Content script loaded and marker injected.");

window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "SYNC_REQUEST") {
        console.log("Bridge: Received SYNC_REQUEST from Dashboard");

        // Forward to Background Script
        const runtime = (typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime : (typeof browser !== 'undefined' ? browser.runtime : null);

        if (!runtime) {
            console.error("SRM Zen Bridge: Runtime not found. This script might be running outside of extension context.");
            window.postMessage({
                type: "SYNC_RESPONSE",
                success: false,
                error: "Extension runtime missing"
            }, "*");
            return;
        }

        runtime.sendMessage({ action: "SYNC_DATA" }, (response) => {
            console.log("Bridge: Received response from Extension", response);

            // Send response back to Dashboard
            window.postMessage({
                type: "SYNC_RESPONSE",
                success: response && response.success,
                data: response ? response.data : null,
                error: response ? response.error : "Unknown error"
            }, "*");
        });
    }
});
