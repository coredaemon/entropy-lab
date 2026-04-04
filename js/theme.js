/**
 * Theme manager: применяет разрешённую цветовую схему к документу.
 * При выборе "system" используется prefers-color-scheme.
 */

import { getThemePreference, THEME } from "./preferences.js";

/**
 * @returns {"light"|"dark"}
 */
export function getResolvedColorScheme() {
  const pref = getThemePreference();
  if (pref === THEME.SYSTEM) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref === THEME.DARK ? "dark" : "light";
}

export function applyTheme() {
  const scheme = getResolvedColorScheme();
  document.documentElement.dataset.colorScheme = scheme;
  document.documentElement.style.colorScheme = scheme;
}

export function initTheme() {
  applyTheme();
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getThemePreference() === THEME.SYSTEM) {
      applyTheme();
    }
  };
  mql.addEventListener("change", onChange);
}
