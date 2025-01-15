let apiKey;
import(chrome.runtime.getURL("./config.js")).then(({ config }) => {
  apiKey = config.api_key;
});
const getSummary = async (text) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the content:${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: {
                    type: "STRING",
                  },
                  content: {
                    type: "STRING",
                  },
                },
              },
            },
          },
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Unexpected API response format");
    }
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.log(err);
  }
};

const newsElement = document.getElementById("news");
function showNews() {
  newsElement.style.display = "block";
  setTimeout(() => {
    newsElement.classList.add("show");
  }, 10);
}

const summarizeButton = document.getElementById("footer");
function hideFooter() {
  setTimeout(() => {
    summarizeButton.classList.add("hide");
  }, 10);
}
document.getElementById("summarize").addEventListener("click", async () => {
  try {
    document.querySelector(".loading-indicator").style.display = "flex";
    hideFooter();
    document.getElementById("content").style.flex = 1;

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      msg: "give me a text",
    });

    if (!response?.text || response.text === "Error while getting text") {
      document.getElementById("content").innerText =
        "Sorry, something went wrong unexpectedly.";
      showNews();
      return;
    }

    const summarizedContent = await getSummary(response.text);

    document.getElementById("content").innerText =
      summarizedContent[0]?.content;
    document.getElementById("title").innerText = summarizedContent[0]?.title;

    document.querySelector(".loading-indicator").style.display = "none";
    document.querySelector(".description").style.display = "none";
    showNews();
  } catch (err) {
    console.log(err);
  }
});
