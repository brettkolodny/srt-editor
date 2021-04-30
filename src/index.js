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
    const reader = new FileReader();

    reader.onload = function (e) {
      captions = new Captions(e.target.result);

      const string = document.getElementById("string");
      string.value = captions.currentSnippet.string;

      const prevButton = document.getElementById("prev-button");
      prevButton.onclick = () => {
        captions.currentSnippet.string = string.value;
        captions.prev();
        string.value = captions.currentSnippet.string;
        player.seekTo(captions.currentSnippet.start);
      };

      const reloadButton = document.getElementById("reload-button");
      reloadButton.onclick = () => {
        player.seekTo(captions.currentSnippet.start);
      };

      const nextButton = document.getElementById("next-button");
      nextButton.onclick = () => {
        captions.currentSnippet.string = string.value;
        captions.next();
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
        downloadLink.download = "output.srt";
        downloadLink.textContent = "Download";

        saveButton.parentElement.appendChild(downloadLink);
      };
    };

    reader.readAsText(file);
  },
  false
);

let startButton = document.getElementById("start-button");
startButton.onclick = () => {
  let urlInput = document.getElementById("video-url");
  let url = new URL(urlInput.value);

  if (captions != null && url.searchParams.has("v")) {
    videoId = url.searchParams.get("v");

    player.loadVideoById(videoId);

    let contentDiv = document.getElementById("content");
    contentDiv.style.display = "flex";

    let setup = document.getElementById("setup");
    setup.style.display = "none";
  }
};
