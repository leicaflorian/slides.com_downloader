async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return tab;
}

chrome.tabs.onActivated.addListener(async function (details) {
  const currentTab = await getCurrentTab();
  const url = currentTab.url;

  if (!url) {
    return;
  }

  if (url.match(/slides\.com/)) {
    // chrome.action.enable()
    chrome.action.setIcon({ path: "assets/imgs/16x16.png" });
    chrome.action.setBadgeText({ text: "Print" });
    chrome.action.setBadgeBackgroundColor({ color: "green" });
  } else {
    // chrome.action.disable()
    chrome.action.setIcon({ path: "assets/imgs/icon-disabled.png" });
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: "green" });
  }
});