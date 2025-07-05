// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "combineTabs" && request.currentWindowId) {
    // Use the currentWindowId sent from the popup
    combineAllTabsIntoCurrentWindow(request.currentWindowId);
  }
});

async function combineAllTabsIntoCurrentWindow(targetWindowId) {
  // This is now the window where the button was actually clicked
  const currentWindowId = targetWindowId;

  // Get all open Chrome windows, including their tabs.
  const allWindows = await chrome.windows.getAll({ populate: true });

  // Loop through all windows.
  for (const window of allWindows) {
    // Skip the target window; we only want to move tabs from *other* windows.
    if (window.id === currentWindowId) {
      continue;
    }

    // Loop through all tabs in this 'other' window.
    // Create a copy of the tabs array, as it might change during the move operation
    const tabsToMove = [...window.tabs];

    for (const tab of tabsToMove) {
      try {
        // Check if the tab still exists and is not already closed
        // This is an extra precaution in case tabs close quickly
        const existingTab = await chrome.tabs.get(tab.id).catch(() => null);
        if (!existingTab) {
          continue; // Tab no longer exists, skip
        }

        // Move the tab to the current window.
        // 'index: -1' places the tab at the end of the tab row in the target window.
        await chrome.tabs.move(tab.id, { windowId: currentWindowId, index: -1 });
      } catch (error) {
        console.error(`Error moving tab ${tab.id} from window ${window.id}:`, error);
        // Optional: display a notification to the user if a tab could not be moved.
      }
    }
    // Optional: close the now empty windows if you want.
    // Check if the window is truly empty after moving the tabs.
    // Note: chrome.windows.remove might throw an error if the window is already closed.
    try {
      const updatedWindow = await chrome.windows.get(window.id, { populate: true }).catch(() => null);
      if (updatedWindow && updatedWindow.tabs.length === 0) {
        await chrome.windows.remove(window.id);
      }
    } catch (error) {
      console.warn(`Could not check/close window ${window.id} (possibly already closed):`, error);
    }
  }
}
