import { loadPreferences } from "./preferences.js";
import { initTheme } from "./theme.js";
import { initI18n, applyDomI18n, dumpI18nDiagnostics } from "./i18n/index.js";
import {
  applyTextSizeAttribute,
  registerPreferencesUI,
} from "./preferences-ui.js";
import { registerEvents } from "./events.js";
import { renderAll } from "./ui.js";

function init() {
  loadPreferences();
  initI18n();
  initTheme();
  applyTextSizeAttribute();
  registerPreferencesUI();
  registerEvents();
  renderAll();
  queueMicrotask(() => applyDomI18n(document.body));
  requestAnimationFrame(() => applyDomI18n(document.body));
  window.addEventListener(
    "load",
    () => applyDomI18n(document.body),
    { once: true },
  );
  try {
    if (new URLSearchParams(location.search).has("i18ndebug")) {
      dumpI18nDiagnostics();
    }
  } catch {
    /* ignore */
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
