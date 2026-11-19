---
skill: browser-apis
title: "API браузера: сховища, fetch, воркери та спостерігачі"
summary: "Де зберігати дані в браузері, як fetch насправді повідомляє про помилки, коли використовувати воркери та API спостерігачів, що замінюють хаки зі scroll і resize."
readingMinutes: 8
---

Браузер є платформою з десятками API. Співбесіди зосереджуються на тих, якими ви користуєтеся щодня, і на їхніх гострих кутах.

## Зберігання даних

| API | Розмір | Тривалість | Доступ | Примітки |
| --- | --- | --- | --- | --- |
| Cookies | ~4 КБ | налаштовується | надсилаються з кожним запитом | для сесій `HttpOnly; Secure; SameSite` |
| `localStorage` | ~5 МБ | доки не очищено | синхронний, лише рядки, одне джерело | блокує головний потік |
| `sessionStorage` | ~5 МБ | на вкладку | синхронний, лише рядки | переживає перезавантаження, але не нові вкладки |
| IndexedDB | великий | доки не очищено | асинхронний, структуровані дані | офлайн-застосунки, великі кеші |
| Cache API | великий | доки не очищено | асинхронний, пари Request/Response | service workers |

`localStorage` зберігає **рядки**. Серіалізуйте через `JSON.stringify` і обгортайте `JSON.parse` у `try/catch`. Запис може кинути помилку (`QuotaExceededError` або приватний режим у деяких браузерах). Ніколи не зберігайте токени автентифікації там, де їх може прочитати XSS; cookie з `HttpOnly` безпечніший.

## fetch

```js
const res = await fetch("/api/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(item),
  signal: AbortSignal.timeout(5000),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`); // fetch НЕ відхиляється на 404/500!
const data = await res.json();
```

`fetch` відхиляється лише при мережевих збоях або скасуванні. HTTP-помилки вирішуються звичайно, тож перевіряйте `res.ok`. Використовуйте `AbortController`, щоб скасовувати застарілі запити, наприклад коли користувач вводить новий пошуковий запит.

## Воркери

- **Web Workers** виконують JavaScript в іншому потоці: розбір великих файлів, обробка зображень, ML-моделі. Вони спілкуються зі сторінкою через `postMessage` і не мають доступу до DOM.
- **Service Workers** стоять між сторінкою й мережею: офлайн-кешування, фонова синхронізація, push-сповіщення. Вони є основою PWA й вимагають HTTPS.

## Спостерігачі

Вони замінюють опитування й дорогі обробники scroll/resize:

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) loadImage(e.target);
}, { rootMargin: "200px" });
document.querySelectorAll("img[data-src]").forEach((img) => io.observe(img));
```

- `IntersectionObserver`: ліниве завантаження, нескінченна прокрутка, аналітика показів.
- `ResizeObserver`: реакція на розмір елемента (компоненти, що враховують контейнер).
- `MutationObserver`: реакція на зміни DOM, зроблені стороннім кодом.

## Інші щоденні API

`URL`/`URLSearchParams` для розбору рядків запиту, `structuredClone` для глибоких копій, `navigator.clipboard`, `history.pushState` для маршрутизації SPA, `requestAnimationFrame` для анімацій, `BroadcastChannel` для синхронізації вкладок.

## Чек-лист для співбесіди

- Оберіть правильне сховище й поясніть його обмеження та наслідки для безпеки.
- Пам'ятайте, що `fetch` вирішується при HTTP-помилках; перевіряйте `res.ok`.
- Скасовуйте застарілі запити через `AbortController`.
- Використовуйте спостерігачів замість опитування scroll/resize.
