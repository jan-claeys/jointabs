document.getElementById('combineTabsButton').addEventListener('click', () => {
  // Get the current tab to obtain its windowId
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const currentWindowId = tabs[0].windowId;
      // Send the windowId along with the message
      chrome.runtime.sendMessage({ action: "combineTabs", currentWindowId: currentWindowId });
      window.close(); // Close the popup after clicking
    } else {
      console.error("No active tab found in the current window.");
      // Optional: display an error message to the user
    }
  });
});
