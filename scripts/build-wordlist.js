const fs = require("node:fs");
const path = require("node:path");

const INPUT_PATH = path.resolve("data/eff_large_wordlist.txt");
const OUTPUT_PATH = path.resolve("data/wordlist-7776.js");

const EXPECTED_WORD_COUNT = 7776;

function fail(message) {
  throw new Error(message);
}

function parseWordlistLine(line, lineNo) {
  if (!line) return null;
  const trimmed = line.trim();
  if (trimmed.length === 0) return null;

  const tabIndex = trimmed.indexOf("\t");
  if (tabIndex === -1) {
    fail(`Некорректная строка #${lineNo}: нет TAB-разделителя`);
  }

  const word = trimmed.slice(tabIndex + 1).trim();
  if (!word) return null;

  return word;
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    fail(`Файл не найден: ${INPUT_PATH}`);
  }

  const content = fs.readFileSync(INPUT_PATH, "utf8");
  const lines = content.split(/\r?\n/);

  const seen = new Set();
  const words = [];

  for (let i = 0; i < lines.length; i++) {
    const word = parseWordlistLine(lines[i], i + 1);
    if (!word) continue;

    if (seen.has(word)) {
      fail(`Слово не уникально (${word}) на строке #${i + 1}`);
    }

    seen.add(word);
    words.push(word);
  }

  if (words.length !== EXPECTED_WORD_COUNT) {
    fail(
      `Ожидалось ровно ${EXPECTED_WORD_COUNT} слов, получено ${words.length}`,
    );
  }

  const wordItems = words.map((w) => JSON.stringify(w)).join(",\n  ");

  const out = `export const WORDLIST = [\n  ${wordItems}\n];\n`;

  fs.writeFileSync(OUTPUT_PATH, out, "utf8");
  console.log(`Сгенерировано: ${OUTPUT_PATH} (${words.length} слов).`);
}

main();

