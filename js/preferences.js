/**
 * Централизованные пользовательские настройки интерфейса и хранение в localStorage.
 *
 * Зафиксированные режимы (контракт приложения):
 * - theme:   "light" | "dark" | "system"
 * - language: "ru" | "en" | "auto"
 * - textSize: "small" | "medium" | "large"
 */

/** @typedef {"light"|"dark"|"system"} ThemePreference */
/** @typedef {"ru"|"en"|"auto"} LanguagePreference */
/** @typedef {"small"|"medium"|"large"} TextSizePreference */

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const LANGUAGE = {
  RU: "ru",
  EN: "en",
  AUTO: "auto",
};

export const TEXT_SIZE = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

const STORAGE = {
  theme: "entropylab.theme",
  language: "entropylab.language",
  textSize: "entropylab.textSize",
};

const DEFAULTS = {
  theme: THEME.SYSTEM,
  language: LANGUAGE.AUTO,
  textSize: TEXT_SIZE.MEDIUM,
};

function readStorage(key, allowed, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return fallback;
    const v = String(raw);
    return allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

/** @type {ThemePreference} */
let themePreference = DEFAULTS.theme;
/** @type {LanguagePreference} */
let languagePreference = DEFAULTS.language;
/** @type {TextSizePreference} */
let textSizePreference = DEFAULTS.textSize;

export function loadPreferences() {
  themePreference = readStorage(STORAGE.theme, Object.values(THEME), DEFAULTS.theme);
  languagePreference = readStorage(
    STORAGE.language,
    Object.values(LANGUAGE),
    DEFAULTS.language,
  );
  textSizePreference = readStorage(
    STORAGE.textSize,
    Object.values(TEXT_SIZE),
    DEFAULTS.textSize,
  );
}

export function getThemePreference() {
  return themePreference;
}

/** @param {ThemePreference} value */
export function setThemePreference(value) {
  if (!Object.values(THEME).includes(value)) return;
  themePreference = value;
  writeStorage(STORAGE.theme, value);
}

export function getLanguagePreference() {
  return languagePreference;
}

/** @param {LanguagePreference} value */
export function setLanguagePreference(value) {
  if (!Object.values(LANGUAGE).includes(value)) return;
  languagePreference = value;
  writeStorage(STORAGE.language, value);
}

export function getTextSizePreference() {
  return textSizePreference;
}

/** @param {TextSizePreference} value */
export function setTextSizePreference(value) {
  if (!Object.values(TEXT_SIZE).includes(value)) return;
  textSizePreference = value;
  writeStorage(STORAGE.textSize, value);
}
