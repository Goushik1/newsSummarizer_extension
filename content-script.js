chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === "give me a text") {
    sendResponse({ text: document.body.innerText });
  }
  return true;
});
