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
    chrome.action.setIcon({ path: "assets/imgs/16x16.png" });
  } else {
    chrome.action.setIcon({ path: "assets/imgs/icon-disabled.png" });
  }
});