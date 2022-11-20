
import engine from "./userNoTouch/engine.js";

import hljs from "./public/js/highlight.min.js";
function handleFileDrop(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  let files = evt.dataTransfer.files; // FileList object.
  handleNewFiles(files);
}
function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}

function handleFileSelect(evt) {
  let files = evt.target.files; // FileList object
  handleNewFiles(files);
}

//Add Drag and Drop Event Listeners
let dropZone = document.getElementById("drop_zone");
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", handleFileDrop, false);

//Add File Browse Event Listeners
document
  .getElementById("files")
  .addEventListener("change", handleFileSelect, false);
let outputName = "";
//Handle and process the file

function handleNewFiles(files) {
  if (files.length > 0) {
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      let data = reader.result;
      document.getElementById("drop_zone").innerHTML = data;
      document.getElementById("outputFile").innerHTML = engine.processAll(data);
      document.getElementById("downloadBtn").disabled = false;

      hljs.highlightAll();
    });
    outputName = engine.getOutputName(files[0].name);
    reader.readAsText(files[0]);
  }
}
function download(filename, textInput) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8, " + encodeURIComponent(textInput)
  );
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
}
document.getElementById("downloadBtn").addEventListener(
  "click",
  function () {
    var text = document.getElementById("outputFile").innerText;
    var filename = outputName;
    download(filename, text);
  },
  false
);
hljs.highlightAll();
