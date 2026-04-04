# EntropyLab

**RU:** Генератор паролей и passphrase с формальной моделью энтропии и локальной генерацией в браузере.  
**EN:** Password and passphrase generator with a formal entropy model and fully local browser-side generation.

---

## EN

# EntropyLab

**EntropyLab** is a browser-based password and passphrase generator built around a **formal entropy model** rather than heuristic “strength” scoring.

It is designed for users who want two things at once:

- practical generation of strong passwords and passphrases
- a transparent mathematical explanation of the search space behind them

---

## Overview

EntropyLab generates:

- **character-based passwords**
- **word-based passphrases**

Unlike many password generators, it does not rely on vague labels such as *weak*, *strong*, or *very strong*.  
Instead, it models entropy explicitly using a stated formula, clear assumptions, and cryptographically secure randomness.

The application runs entirely in the browser and performs generation locally on the client side.

---

## Why EntropyLab

Most generators optimize for convenience but hide the underlying logic. EntropyLab takes a different approach:

- **formal entropy calculations** instead of heuristics
- **cryptographically secure randomness** instead of `Math.random()`
- **local generation** instead of server-side processing
- **simple defaults** with optional advanced controls
- a clean interface for both **desktop** and **mobile / PWA-style** usage

---

## Features

### Core generation
- Cryptographically secure randomness via the **Web Crypto API**
- No use of `Math.random()`
- Generation of multiple outputs in one run
- Support for:
  - character passwords
  - passphrases

### Modes
- **Standard mode** for quick, practical use
- **Advanced mode** for more precise control

### Advanced controls
Depending on the selected generation type, EntropyLab supports options such as:

- target entropy
- character class selection
- exclusion of visually similar characters
- requiring all selected character classes
- passphrase separator selection
- number of generated results

### Interface
- Fully client-side
- Responsive desktop and mobile layouts
- Light / dark / system theme
- Language switching
- Reading comfort size options
- Copy-to-clipboard actions for generated results

---

## Entropy Model

EntropyLab uses a formal search-space model.

### Character passwords

For character-based passwords:

`E = L × log₂(N)`

Where:

- `E` — entropy in bits
- `L` — password length
- `N` — alphabet size

If a password of length `L` is chosen uniformly at random from an alphabet of size `N`, then the total search space is `N^L`, and the entropy is:

`log₂(N^L) = L × log₂(N)`

---

### Passphrases

For passphrases:

`E = k × log₂(D)`

Where:

- `E` — entropy in bits
- `k` — number of words
- `D` — dictionary size

If each word is selected independently and uniformly from a dictionary of size `D`, then the total search space is `D^k`, and the entropy is:

`log₂(D^k) = k × log₂(D)`

---

## Security Notes

EntropyLab models **generation entropy**, not total real-world security.

### Model assumptions
The reported entropy values are valid under the following assumptions:

- values are selected **uniformly at random**
- selections are **independent**
- the alphabet or dictionary is correctly defined
- the attacker model is one of **search-space exploration / brute-force reasoning**

### Important limitations
Real-world resistance can still depend on factors outside the formal model, including:

- password reuse
- phishing
- malware or clipboard theft
- local device compromise
- insecure storage or transmission
- human handling mistakes

EntropyLab estimates the strength of randomly generated outputs under a formal model.  
It does **not** replace broader security hygiene.

---

## Passphrase Dictionary

EntropyLab supports passphrase generation using a **7776-word dictionary**.

This allows passphrases with a predictable and formally measurable search space while remaining easier to memorize than many symbol-heavy passwords.

---

## Live Demo

**Demo:**  
https://coredaemon.github.io/entropy-lab/

---

## Tech Stack

- **Vanilla JavaScript**
- **HTML**
- **CSS**
- **Web Crypto API**
- No framework
- No backend

---

## Project Structure

```text
.
├── index.html
├── css/
│   └── ...
├── js/
│   ├── app.js
│   ├── ui.js
│   ├── math/
│   │   └── ...
│   ├── generators/
│   │   └── ...
│   ├── i18n/
│   │   └── ...
│   └── ...
├── data/
│   └── ...
├── LICENSE
└── README.md

```

---

## RU

### О проекте

**EntropyLab** — это браузерный инструмент для генерации:

- символьных паролей
- passphrase (фраз из слов)

Проект делает упор не на эвристические оценки вроде “слабый / сильный”, а на **прозрачную математическую модель энтропии**.

EntropyLab рассчитан на пользователей, которым нужен не просто генератор, а понятный инструмент с формальным объяснением, откуда берётся оценка стойкости.

---

### Основные возможности

#### Генерация
- криптографически стойкая случайность через **Web Crypto API**
- без использования `Math.random()`
- генерация нескольких вариантов за один запуск
- поддержка:
  - символьных паролей
  - passphrase

#### Режимы работы
- **Обычный режим** — быстрый и понятный сценарий
- **Расширенный режим** — более гибкая настройка параметров

#### Расширенные настройки
В зависимости от выбранного типа генерации доступны:

- целевая энтропия
- выбор классов символов
- исключение похожих символов
- требование использовать все выбранные классы
- выбор разделителя для passphrase
- количество генерируемых вариантов

#### Интерфейс
- полностью клиентская работа
- адаптация под desktop и mobile
- светлая / тёмная / системная тема
- переключение языка интерфейса
- режимы читаемости
- быстрое копирование результатов

---

### Математическая модель

EntropyLab использует формальную модель пространства перебора.

#### Для символьных паролей

Формула:

`E = L × log₂(N)`

Где:

- `E` — энтропия в битах
- `L` — длина пароля
- `N` — размер алфавита

Если пароль длины `L` выбирается равновероятно из алфавита размера `N`, то размер пространства поиска равен `N^L`, а энтропия:

`log₂(N^L) = L × log₂(N)`

---

#### Для passphrase

Формула:

`E = k × log₂(D)`

Где:

- `E` — энтропия в битах
- `k` — количество слов
- `D` — размер словаря

Если каждое слово выбирается независимо и равновероятно из словаря размера `D`, то пространство поиска равно `D^k`, а энтропия:

`log₂(D^k) = k × log₂(D)`

---

### Важные замечания по безопасности

EntropyLab рассчитывает **энтропию генерации**, а не даёт “магическую” оценку абсолютной безопасности.

#### Предположения модели
Расчёты корректны при следующих условиях:

- выбор происходит **равномерно**
- выборы **независимы**
- алфавит или словарь определены корректно
- рассматривается модель перебора / поиска по пространству вариантов

#### Ограничения
Реальная стойкость также зависит от факторов, которые находятся вне формулы:

- повторное использование паролей
- фишинг
- вредоносное ПО
- компрометация устройства
- небезопасное хранение или передача
- ошибки пользователя

Иными словами: EntropyLab моделирует **поиск по пространству случайно сгенерированных значений**, но не заменяет общую цифровую гигиену.

---

### Словарь passphrase

Для passphrase используется словарь на **7776 слов**.

Это позволяет строить фразы с предсказуемым и формально вычисляемым пространством поиска, сохраняя при этом лучшую запоминаемость по сравнению с многими символьными паролями.

---

### Почему EntropyLab

В отличие от типичных генераторов, EntropyLab делает акцент на:

- прозрачности модели
- криптографически стойкой генерации
- локальной работе без сервера
- разделении простого режима и точной настройки
- чистом интерфейсе без избыточной “магии”

---

### Live Demo

**Демо:**  
https://coredaemon.github.io/entropy-lab/

---

### Технологии

- **Vanilla JavaScript**
- **HTML**
- **CSS**
- **Web Crypto API**
- без фреймворков
- без backend

---

### Структура проекта

```text
.
├── index.html
├── css/
│   └── ...
├── js/
│   ├── app.js
│   ├── ui.js
│   ├── math/
│   │   └── ...
│   ├── generators/
│   │   └── ...
│   ├── i18n/
│   │   └── ...
│   └── ...
├── data/
│   └── ...
├── LICENSE
└── README.md