class SrtSnippet {
  index = null;
  timeString = null;
  start = null;
  string = null;
  next = null;
  prev = null;

  constructor(index, timeString, string) {
    this.index = index;
    this.timeString = timeString;
    this.start = this.srtTimeToSeconds(timeString.split(" --> ")[0]);
    this.string = string;
  }

  srtTimeToSeconds(time) {
    let [hours, minutes, seconds] = time.split(":");
    let [secs, mili] = seconds.split(",");

    let totalSeconds = 0;
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseInt(secs);
    totalSeconds += parseInt(mili) / 1000;

    return totalSeconds;
  }
}

export default class Captions {
  currentSnippet = null;

  constructor(srtFile) {
    this.parseFile(srtFile);
  }

  parseFile(srt) {
    const srtSplit = srt.split("\n");

    let head = null;
    let prev = null;

    let lineNum = 0;
    while (lineNum < srtSplit.length) {
      if (srtSplit[lineNum] == "") {
        lineNum++;
        continue;
      }

      const index = parseInt(srtSplit[lineNum]);
      lineNum++;

      const timeString = srtSplit[lineNum];
      lineNum++;

      const string = srtSplit[lineNum];
      lineNum++;

      let newSnippet = new SrtSnippet(index, timeString, string);

      if (head == null) {
        head = newSnippet;
        prev = newSnippet;
      } else {
        prev.next = newSnippet;
        newSnippet.prev = prev;
        prev = newSnippet;
      }
    }

    this.currentSnippet = head;
  }

  next() {
    if (this.currentSnippet.next != null) {
      this.currentSnippet = this.currentSnippet.next;
    }
  }

  prev() {
    if (this.currentSnippet.prev != null) {
      this.currentSnippet = this.currentSnippet.prev;
    }
  }

  setString(newString) {
    this.currentSnippet.string = newString;
  }

  writeToString() {
    let head = this.currentSnippet;

    while (head.prev != null) {
      head = head.prev;
    }

    let outputString = "";

    while (head != null) {
      outputString += `${head.index}\n`;
      outputString += `${head.timeString}\n`;
      outputString += `${head.string}\n\n`;

      head = head.next;
    }

    return outputString;
  }
}
