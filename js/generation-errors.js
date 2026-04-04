/**
 * Преобразование ошибок генераторов в локализованные сообщения (без правок math).
 */

import { t } from "./i18n/index.js";

export function formatPasswordGenerationError(err) {
  if (!(err instanceof Error)) return t("errors.passwordGen");
  const m = err.message;
  if (m.startsWith("Алфавит пуст")) return t("errors.genEmptyAlphabet");
  if (m.includes("Нет доступных классов")) return t("errors.genNoClasses");
  const match =
    /^Недостаточная длина пароля \((\d+)\) для покрытия всех выбранных классов \((\d+)\)/.exec(
      m,
    );
  if (match) {
    return t("errors.genLengthVsClasses", { length: match[1], k: match[2] });
  }
  if (m.startsWith("Несоответствие размера")) return t("errors.genInternal");
  return t("errors.passwordGen");
}

export function formatPassphraseGenerationError(err) {
  if (!(err instanceof Error)) return t("errors.passphraseGen");
  return t("errors.passphraseGen");
}
