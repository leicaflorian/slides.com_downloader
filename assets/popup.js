let reloadBtn = document.getElementById("reloadBtn");
let printBtn = document.getElementById("printBtn");
let currentTab;

function checkBtnsStatus() {
  const url = currentTab.url;
  const urlParams = url.slice(url.indexOf("?"));

  if (!url.includes("slides.com") || !url.includes("token=")) {
    reloadBtn.disabled = true;
    printBtn.disabled = true;
  } else {
    reloadBtn.disabled = urlParams.includes("print-pdf");
    printBtn.disabled = !urlParams.includes("print-pdf");
  }
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

chrome.webNavigation.onCompleted.addListener(async function (details) {
  if (details.tabId === currentTab.id) {
    await getCurrentTab();
    checkBtnsStatus();
  }
});

reloadBtn.addEventListener("click", async () => {
  executeOnCurrentTab(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);

    urlParams.append("print-pdf", "");

    window.location.search = "?" + urlParams.toString();

  });

  await getCurrentTab();
  checkBtnsStatus();
});

printBtn.addEventListener("click", async () => {
  executeOnCurrentTab(() => {
    const pages = document.querySelectorAll(".pdf-page");
    pages.forEach(page => {
      page.style.height = "755px";
    });

    const slides = document.querySelectorAll(".slides");
    slides.forEach(slide => {
      slide.style.backgroundColor = "white";
    });

    window.print();
  });
});

getCurrentTab()
  .then(() => {
    checkBtnsStatus();
  });