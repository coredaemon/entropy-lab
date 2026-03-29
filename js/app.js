import { registerEvents } from "./events.js";
import { renderAll } from "./ui.js";

function init() {
  renderAll();
  registerEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
