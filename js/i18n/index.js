/**
 * Централизованный i18n-слой: выбор локали и подстановка строк.
 */

import { getLanguagePreference, LANGUAGE } from "../preferences.js";
import { STRINGS } from "./strings.js";

/**
 * Последний резерв, если строка отсутствует в таблице — никогда не показываем сырой ключ с точками.
 * @param {string} key
 */
function humanizeMissingKey(key) {
  const tail = key.includes(".") ? key.slice(key.lastIndexOf(".") + 1) : key;
  const spaced = tail
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  const words = spaced.replace(/_/g, " ").trim();
  if (!words) return "…";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * @returns {"ru"|"en"}
 */
export function resolveLocale() {
  const pref = getLanguagePreference();
  if (pref === LANGUAGE.RU) return "ru";
  if (pref === LANGUAGE.EN) return "en";
  const nav = typeof navigator !== "undefined" && navigator.language
    ? String(navigator.language).toLowerCase()
    : "";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars) {
  const keyNorm = String(key ?? "").trim();
  const locale = resolveLocale();
  let text = STRINGS[locale]?.[keyNorm];
  if (text == null || text === "") {
    text = STRINGS.en[keyNorm] ?? STRINGS.ru[keyNorm];
  }
  if (text == null || text === "") {
    text = humanizeMissingKey(keyNorm);
  }
  if (text === keyNorm) {
    text = humanizeMissingKey(keyNorm);
  }
  if (vars && typeof text === "string") {
    return text.replace(/\{(\w+)\}/g, (_, name) => {
      const v = vars[name];
      return v != null ? String(v) : "";
    });
  }
  return text;
}

const PROBE_KEYS = [
  "settings.langRuShort",
  "settings.langEnShort",
  "settings.langAutoShort",
  "settings.themeLightShort",
  "settings.themeDarkShort",
  "settings.themeSystemShort",
  "settings.textSizeSmallShort",
  "settings.textSizeMediumShort",
  "settings.textSizeLargeShort",
  "section.workspace",
  "footer.localPrivacy",
  "footer.versionLabel",
  "footer.linkGithub",
];

/**
 * Вызов из консоли или с ?i18ndebug=1 — сверка locale, t(key), словарей и DOM.
 */
export function dumpI18nDiagnostics() {
  const locale = resolveLocale();
  const rows = PROBE_KEYS.map((k) => ({
    key: k,
    t: t(k),
    ru: Object.prototype.hasOwnProperty.call(STRINGS.ru, k),
    en: Object.prototype.hasOwnProperty.call(STRINGS.en, k),
  }));
  console.info("[i18n] locale =", locale);
  console.table(rows);
  const bad = [];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = (el.getAttribute("data-i18n") || "").trim();
    const before = el.textContent.trim();
    if (!k) return;
    if (before === k) bad.push({ key: k, text: before, el });
  });
  if (bad.length) {
    console.warn("[i18n] elements where text === key (raw key visible):", bad);
  } else {
    console.info("[i18n] no [data-i18n] nodes with text === key");
  }
}

/**
 * Обновляет document.title и lang.
 */
export function applyDocumentLanguage() {
  const locale = resolveLocale();
  document.documentElement.lang = locale === "ru" ? "ru" : "en";
  document.title = t("app.title");
}

/**
 * Элементы с data-i18n="key" получают textContent из t(key).
 * data-i18n-attr="aria-label:key" — выставляет атрибут.
 */
export function applyDomI18n(root = document.body) {
  if (!root) return;

  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = (el.getAttribute("data-i18n") || "").trim();
    if (!key) return;
    const prev = el.textContent.trim();
    const next = t(key);
    if (next !== "") {
      el.textContent = next;
    } else if (prev) {
      el.textContent = prev;
    } else {
      el.textContent = humanizeMissingKey(key);
    }
    if (el.textContent.trim() === key) {
      el.textContent = humanizeMissingKey(key);
    }
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = (el.getAttribute("data-i18n-placeholder") || "").trim();
    if (!key || !(el instanceof HTMLInputElement)) return;
    const next = t(key);
    el.placeholder = next !== "" ? next : humanizeMissingKey(key);
    if (el.placeholder.trim() === key) {
      el.placeholder = humanizeMissingKey(key);
    }
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = (el.getAttribute("data-i18n-aria") || "").trim();
    if (!key) return;
    const next = t(key);
    const aria = next !== "" ? next : humanizeMissingKey(key);
    el.setAttribute("aria-label", aria);
    if (el.getAttribute("aria-label") === key) {
      el.setAttribute("aria-label", humanizeMissingKey(key));
    }
  });

  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = (el.getAttribute("data-i18n-title") || "").trim();
    if (!key) return;
    const next = t(key);
    const title = next !== "" ? next : humanizeMissingKey(key);
    el.setAttribute("title", title);
    if (el.getAttribute("title") === key) {
      el.setAttribute("title", humanizeMissingKey(key));
    }
  });
}

export function initI18n() {
  applyDocumentLanguage();
  applyDomI18n();
}
