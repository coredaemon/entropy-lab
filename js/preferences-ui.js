/**
 * Связывает DOM настроек интерфейса с preferences, theme, i18n и типографикой.
 */

import {
  getThemePreference,
  setThemePreference,
  THEME,
  getLanguagePreference,
  setLanguagePreference,
  LANGUAGE,
  getTextSizePreference,
  setTextSizePreference,
  TEXT_SIZE,
} from "./preferences.js";
import { applyTheme } from "./theme.js";
import { initI18n } from "./i18n/index.js";
import { renderAll } from "./ui.js";

function syncRadioGroup(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = input.value === String(value);
  });
}

export function applyTextSizeAttribute() {
  document.documentElement.dataset.textSize = getTextSizePreference();
}

const MOBILE_MAX_PX = 639;

function syncDesktopPrefsInert() {
  const desktop = document.querySelector(".app-topbar__prefs--desktop");
  if (!desktop) return;
  const narrow =
    typeof window.matchMedia === "function" &&
    window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches;
  try {
    desktop.inert = narrow;
  } catch {
    /* inert unsupported */
  }
}

function syncSettingsDialogShell() {
  const dialog = document.getElementById("app-settings-dialog");
  if (!dialog) return;
  const desktop =
    typeof window.matchMedia === "function" &&
    window.matchMedia(`(min-width: ${MOBILE_MAX_PX + 1}px)`).matches;
  try {
    dialog.inert = desktop;
  } catch {
    /* inert unsupported */
  }
  dialog.setAttribute("aria-hidden", desktop ? "true" : "false");
  if (desktop && typeof dialog.close === "function" && dialog.open) {
    dialog.close();
  }
}

function registerAppSettingsDialog() {
  const dialog = document.getElementById("app-settings-dialog");
  const openBtn = document.querySelector("[data-open-app-settings]");
  const closeBtn = document.querySelector("[data-close-app-settings]");
  if (!dialog || !openBtn) return;

  openBtn.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
  closeBtn?.addEventListener("click", () => {
    dialog.close();
  });
  dialog.addEventListener("click", (ev) => {
    if (ev.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    syncDesktopPrefsInert();
  });
}

export function registerPreferencesUI() {
  applyTextSizeAttribute();

  syncRadioGroup("ui-theme", getThemePreference());
  syncRadioGroup("ui-language", getLanguagePreference());
  syncRadioGroup("ui-text-size", getTextSizePreference());

  syncDesktopPrefsInert();
  syncSettingsDialogShell();
  registerAppSettingsDialog();
  if (typeof window.matchMedia === "function") {
    window
      .matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`)
      .addEventListener("change", () => {
        syncDesktopPrefsInert();
        syncSettingsDialogShell();
      });
  }

  document.querySelectorAll('input[name="ui-theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setThemePreference(/** @type {import("./preferences.js").ThemePreference} */ (input.value));
      applyTheme();
      renderAll();
    });
  });

  document.querySelectorAll('input[name="ui-language"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setLanguagePreference(
        /** @type {import("./preferences.js").LanguagePreference} */ (input.value),
      );
      initI18n();
      renderAll();
    });
  });

  document.querySelectorAll('input[name="ui-text-size"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setTextSizePreference(
        /** @type {import("./preferences.js").TextSizePreference} */ (input.value),
      );
      applyTextSizeAttribute();
      renderAll();
    });
  });
}
