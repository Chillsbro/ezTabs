let myTabs = [];
const inputEl = document.getElementById("input-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const tabsFromLocalStorage = JSON.parse(localStorage.getItem("myTabs"));
const tabBtn = document.getElementById("tab-btn");

if (tabsFromLocalStorage) {
  myTabs = tabsFromLocalStorage;
  render(myTabs);
}
function handleInputBtnClick(e){
  e.preventDefault();
  const url = inputEl.value;
  if (url) {
    const siteName = extractSiteNameFromUrl(url);
    myTabs.push({ url, siteName, imageUrl: "" });
    inputEl.value = "";
    localStorage.setItem("myTabs", JSON.stringify(myTabs));
    render(myTabs);
  }
}
tabBtn.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    fetch(
      `https://opengraph.io/api/1.1/site/${encodeURIComponent(
        url
      )}?app_id=5e972394-e012-400c-ae33-d4a308da13c7` //need website api? for all websites?
    )
      .then((response) => response.json())
      .then((data) => {
        const siteName = data.hybridGraph.title || data.hybridGraph.site_name;
        const imageUrl = data.hybridGraph.image || "";
        myTabs.push({ url, siteName, imageUrl });
        localStorage.setItem("myTabs", JSON.stringify(myTabs));
        render(myTabs);
      })
      .catch((error) => console.error(error));
  });
});

function render(tabs) {
  let listItems = "";
  for (let i = 0; i < tabs.length; i++) {
    const { url, siteName, imageUrl } = tabs[i];
    listItems += `
            <li>
                <a target='_blank' href='${url}'>
                    <div class="tab-image" style="background-image: url('${imageUrl}')"></div>
                    <div class="tab-info">
                      <div class="tab-title">${siteName}</div>
                      <div class="tab-url">${url}</div>
                    </div>
                </a>
            </li>
        `;
  }
  ulEl.innerHTML = listItems;
}

deleteBtn.addEventListener("click", function () {
  localStorage.clear();
  myTabs = [];
  render(myTabs);
});

inputBtn.addEventListener("click", handleInputBtnClick);

function extractSiteNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error("Error extracting site name: ", error);
    return "Unknown Site";
  }
}
