import YouTubePlayer from "youtube-player";
import Captions from "./Captions";
import "regenerator-runtime/runtime";

const player = YouTubePlayer("player");

let captions = null;
let videoId = null;

let fileName = null;

const fileInput = document.getElementById("file-input");

fileInput.addEventListener(
  "change",
  async (event) => {
    const file = event.target.files[0];
    fileName = file.name;

    document.getElementById("file-name").textContent = fileName;
    const reader = new FileReader();

    reader.onerror = (e => console.log(e));

    reader.onload = function (e) {
      captions = new Captions(e.target.result);

      const string = document.getElementById("string");
      string.value = captions.currentSnippet.string;

      const prevButton = document.getElementById("prev-button");
      prevButton.onclick = () => {
        const currentIndex = captions.currentSnippet.index;
        const lastSelected = document.getElementById(`snippet-${currentIndex}`);

        captions.currentSnippet.string = string.value;
        lastSelected.textContent = captions.currentSnippet.string;
        captions.prev();

        const newIndex = captions.currentSnippet.index;

        if (currentIndex != newIndex) {
          const newSelected = document.getElementById(`snippet-${newIndex}`);

          lastSelected.classList.remove("selected");
          newSelected.classList.add("selected");
        }

        string.value = captions.currentSnippet.string;
        player.seekTo(captions.currentSnippet.start);
      };

      const reloadButton = document.getElementById("reload-button");
      reloadButton.onclick = () => {
        player.seekTo(captions.currentSnippet.start);
      };

      const nextButton = document.getElementById("next-button");
      nextButton.onclick = () => {
        const currentIndex = captions.currentSnippet.index;
        const lastSelected = document.getElementById(`snippet-${currentIndex}`);

        captions.currentSnippet.string = string.value;
        lastSelected.textContent = captions.currentSnippet.string;
        captions.next();

        const newIndex = captions.currentSnippet.index;

        if (currentIndex != newIndex) {
          const newSelected = document.getElementById(`snippet-${newIndex}`);

          lastSelected.classList.remove("selected");
          newSelected.classList.add("selected");
        }

        string.value = captions.currentSnippet.string;
        player.seekTo(captions.currentSnippet.start);
      };

      const saveButton = document.getElementById("save-button");
      saveButton.onclick = () => {
        captions.currentSnippet.string = string.value;
        let output = captions.writeToString();

        const outputBlog = new Blob([output], { type: "text/plain" });

        const outputFile = URL.createObjectURL(outputBlog);

        const downloadLink = document.createElement("a");
        downloadLink.href = outputFile;
        downloadLink.download = `${fileName.split(".")[0]}_EDIT.srt`;
        downloadLink.textContent = "Download";

        saveButton.parentElement.appendChild(downloadLink);

        window.requestAnimationFrame(() => {
          const clickEvent = new MouseEvent("click");
          downloadLink.dispatchEvent(clickEvent);
          downloadLink.remove();
        });
      };

      const sidebarDiv = document.getElementById("sidebar");
      let head = captions.currentSnippet;

      let first = true;
      while (head != null) {
        const snippetDiv = document.createElement("div");
        snippetDiv.className = "sidebar-snippet";
        snippetDiv.id = `snippet-${head.index}`;
        snippetDiv.textContent = head.string;

        if (first) {
          snippetDiv.classList.add("selected");
          first = false;
        }

        const snippet = head;
        snippetDiv.onclick = () => {
          const lastString = string.value;
          captions.currentSnippet.string = lastString;

          captions.currentSnippet = snippet;
          string.value = snippet.string;
          player.seekTo(snippet.start);

          const selectedElements = document.getElementsByClassName("selected");
          if (selectedElements.length != 0) {
            const selected = selectedElements[0];
            selected.classList.remove("selected");
            selected.textContent = lastString;

            snippetDiv.classList.add("selected");
          }
        };

        sidebarDiv.appendChild(snippetDiv);
        head = head.next;
      }
    };

    reader.readAsText(file);
  },
  false
);

let startButton = document.getElementById("start-button");
startButton.onclick = () => {
  let urlInput = document.getElementById("video-url");
  let url;

  try {
    url = new URL(urlInput.value);
  } catch {
    url = null;
  }

  let videoId = null;

  if (url != null && url.searchParams.has("v")) {
    videoId = url.searchParams.get("v");
  } else if (url != null && url.hostname == "youtu.be") {
    videoId = url.pathname.split("/")[1];
  }

  if (captions != null && videoId != null) {
    player.loadVideoById(videoId);

    let contentDiv = document.getElementById("content");
    contentDiv.style.display = "flex";

    let setup = document.getElementById("setup");
    setup.style.display = "none";
  } else {
    alert("Improper video link or file");
  }
};
