/**
 * @typedef {{
             frameId: number
             result: {embed: boolean, fullscreen: boolean}
           }} CheckSlidePageResult
 */

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return tab;
}

/**
 * 
 * @returns {Promise<CheckSlidePageResult[]>}
 */
async function checkSlidePage(tabId) {
  return await chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: () => {
        // if fullscreen
        return {
          fullscreen: !!document.querySelector("body.reveal-viewport > .reveal .slides"),
          embed: !!document.querySelector("#main > .marquee > .reveal-frame > .reveal-viewport > .reveal .slides")
        };
      }
    });
}

/**
 * 
 * @param {id} tabId 
 * @returns {Promise<CheckSlidePageResult>}
 */
async function isValidaSlidesPage(tabId) {
  /**
   * @type {CheckSlidePageResult}
   */
  const checkResult = (await checkSlidePage(tabId))[0];

  const result = checkResult.result;

  if (!result.embed && !result.fullscreen) {
    return Promise.reject();
  }
}

async function enableIcon() {
  chrome.action.enable();
  chrome.action.setIcon({ path: "assets/imgs/16x16.png" });
  chrome.action.setBadgeText({ text: "Print" });
  chrome.action.setBadgeBackgroundColor({ color: "green" });
}

async function disableIcon() {
  chrome.action.disable();
  chrome.action.setIcon({ path: "assets/imgs/icon-disabled.png" });
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setBadgeBackgroundColor({ color: "green" });
}

async function checkCurrentTab(tab) {
  const currentTab = tab || await getCurrentTab();

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });

  if (!currentTab) {
    return;
  }

  const url = currentTab.url;
  const tabId = currentTab.id || currentTab.tabId;

  if (!url) {
    return;
  }

  try {
    if (url.match(/http(s|):\/\/slides\.com/)) {
      await isValidaSlidesPage(tabId);

      enableIcon();
    } else {
      disableIcon();
    }
  } catch (er) {
    disableIcon();
  }
}

chrome.tabs.onCreated.addListener(() => {
  console.log("tabs onCreated");
  checkCurrentTab();
});
chrome.tabs.onActivated.addListener(() => {
  console.log("tabs onActivated");
  checkCurrentTab();
});
chrome.tabs.onAttached.addListener(() => {
  console.log("tabs.onAttached");
  checkCurrentTab();
});
chrome.tabs.onUpdated.addListener(() => {
  console.log("tabs onUpdated");
  checkCurrentTab();
});

/* chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  console.log("webNavigation.onDOMContentLoaded");
  checkCurrentTab(details);
}); */

/*
The action.onClicked event will not be dispatched if the extension
action has specified a popup to show on click on the current tab.
*/
/* chrome.action.onClicked.addListener(async (tab) => {


  debugger;
  const pageResult = (await checkSlidePage())[0];
  const isFullscreen = pageResult.result.fullscreen;

  if (!isFullscreen) {

  }
}); */
