# EntropyLab

**Генератор паролей и passphrase с математически строгой моделью энтропии.**  
**Password and passphrase generator with mathematically grounded entropy model.**

---

## 🔐 О проекте / About

EntropyLab — это инструмент для генерации:

- символьных паролей
- passphrase (фраз из слов)

с использованием строгой математической модели энтропии, а не эвристик.

EntropyLab is a tool for generating:

- character-based passwords  
- passphrases  

using a strict mathematical entropy model instead of heuristics.

---

## ⚙️ Основные возможности / Features

- Криптографически стойкая генерация (без `Math.random()`)  
- Генерация нескольких вариантов  
- Поддержка passphrase (словарь 7776 слов)  
- Расчёт энтропии по формуле  
- Обычный режим (просто и понятно)  
- Расширенный режим (гибкая настройка)  

---

- Cryptographically secure randomness (no `Math.random()`)  
- Multiple password generation  
- Passphrase support (7776-word dictionary)  
- Entropy calculation based on formal model  
- Simple mode (easy to use)  
- Advanced mode (fine-grained control)  

---

## 🧠 Математическая модель / Entropy Model

Для символьных паролей: E = L × log₂(N)
где:
- L — длина пароля  
- N — размер алфавита  

---

For passphrases: E = L × log₂(N)
where:
- k — number of words  
- D — dictionary size  

---

## ⚠️ Важно / Disclaimer

- Энтропия рассчитывается для модели равномерного случайного выбора  
- Реальная стойкость зависит от атакующей модели  
- Инструмент не делает "магических" оценок безопасности  

---

- Entropy is calculated under uniform randomness assumptions  
- Real-world security depends on attacker capabilities  
- No heuristic or "magic" strength estimation is used  

---

## 🚀 Демо / Live Demo
👉 https://coredaemon.github.io/entropy-lab/

---

## 📦 Технологии / Tech Stack
- Vanilla JavaScript  
- No frameworks  
- No backend  
- Fully client-side  

---

## 📁 Структура проекта / Project Structure
css/ — стили
js/ — логика приложения
js/math/ — расчёты
js/generators/ — генерация
data/ — словарь


---

## 🛠 Запуск локально / Run Locally
Просто открой: index.html
в браузере.

---

## 📄 Лицензия / License
MIT

---

## 👤 Автор / Author
coredaemon