let reloadBtn = document.getElementById("reloadBtn");
let printBtn = document.getElementById("printBtn");
let returnBtn = document.getElementById("returnBtn");
let currentTab;

function checkBtnsStatus() {
  const url = currentTab.url;
  const urlParams = url.slice(url.indexOf("?"));

  /* if (!url.includes("slides.com") || !url.includes("token=")) {
    reloadBtn.disabled = true;
    printBtn.disabled = true;
  } else { */
  reloadBtn.disabled = urlParams.includes("print-pdf");
  printBtn.disabled = !urlParams.includes("print-pdf");
  returnBtn.disabled = !urlParams.includes("print-pdf");
  // }
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  currentTab = tab;
}

function executeOnCurrentTab(fn) {
  chrome.scripting.executeScript(
    {
      target: { tabId: currentTab.id },
      func: fn
    });
}

function injectDomStyles() {
  executeOnCurrentTab(async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const pages = document.querySelectorAll(".pdf-page");

    console.log(pages);

    pages.forEach(page => {
      page.style.height = pages[0].style.height;
    });

    const slides = document.querySelectorAll(".slides");
    slides.forEach(slide => {
      slide.style.backgroundColor = "white";
    });

    window.print();
  });
}

chrome.webNavigation.onCompleted.addListener(async function (details) {
  if (details.tabId === currentTab.id) {
    await getCurrentTab();
    checkBtnsStatus();

    if (currentTab.url.match("print-pdf")) {
      injectDomStyles();
    }
  }
});

reloadBtn.addEventListener("click", async () => {
  executeOnCurrentTab(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);

    urlParams.append("print-pdf", "");

    const isFullscreen = window.location.toString().includes("/fullscreen");

    let newUrl = window.location.origin + window.location.pathname;

    if (!isFullscreen) {
      newUrl += "/fullscreen";
    }

    window.location = newUrl + "?" + urlParams.toString();

  });

  await getCurrentTab();
  checkBtnsStatus();
});

printBtn.addEventListener("click", async () => {
  injectDomStyles();
});

returnBtn.addEventListener("click", async () => {
  executeOnCurrentTab(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);

    urlParams.delete("print-pdf");

    window.location.search = "?" + urlParams.toString();
  });

  await getCurrentTab();
  checkBtnsStatus();
  window.close();
});

getCurrentTab()
  .then(() => {
    checkBtnsStatus();
  });