---
skill: dom-events
title: "DOM і події: поширення, делегування та дії за замовчуванням"
summary: "Як події проходять через DOM, як делегування робить обробники дешевими й динамічними та як ефективно шукати й змінювати DOM."
readingMinutes: 7
---

Фреймворки приховують DOM, але інтерв'юери все одно очікують, що ви знаєте, що відбувається під капотом, особливо як рухаються події.

## Пошук і зміна

```js
const list = document.querySelector("#todo");          // перший збіг або null
const items = document.querySelectorAll(".item");     // статичний NodeList
const li = document.createElement("li");
li.textContent = userInput;                             // безпечно: без розбору HTML
list.append(li);
```

- Для даних користувача використовуйте `textContent`. `innerHTML` розбирає HTML і відкриває шлях до **XSS**.
- Групуйте записи в DOM. Читання геометрії (`offsetHeight`, `getBoundingClientRect`) одразу після запису змушує синхронно перераховувати розкладку («layout thrashing»).
- `classList.toggle("open", isOpen)` і `dataset.id` чистіші за роботу з рядками.

## Поширення подій

Подія проходить три фази:

1. **Занурення (capture)**: від `window` донизу до батька цілі.
2. **Ціль (target)**: на елементі, по якому клікнули.
3. **Спливання (bubble)**: назад угору до `window`.

```js
el.addEventListener("click", handler);                    // фаза спливання (за замовчуванням)
el.addEventListener("click", handler, { capture: true }); // фаза занурення
el.addEventListener("scroll", onScroll, { passive: true }); // обіцяємо не викликати preventDefault
el.addEventListener("click", once, { once: true });        // автоматично знімається після першого виклику
```

- `event.target` є елементом, де подія почалася. `event.currentTarget` є елементом, чий обробник зараз виконується.
- `stopPropagation()` зупиняє рух події. Використовуйте обережно, бо це ламає делегування й аналітику вище за ієрархією.
- `preventDefault()` скасовує дію браузера за замовчуванням (перехід за посиланням, надсилання форми, позначення чекбокса). Поширення події він не зупиняє.

Не всі події спливають: `focus`/`blur` ні (використовуйте `focusin`/`focusout`), `mouseenter`/`mouseleave` теж ні.

## Делегування подій

Замість окремого обробника на кожен елемент додайте **один** обробник на контейнер і знаходьте елемент через `event.target`:

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("button.delete");
  if (!button || !list.contains(button)) return;
  removeTodo(button.closest("li").dataset.id);
});
```

Переваги: менше обробників, а елементи, додані пізніше, працюють автоматично. `closest` обробляє кліки по іконках чи span усередині кнопки.

## Прибирання

Знімайте непотрібні обробники (`removeEventListener` з тим самим посиланням на функцію або сигнал `AbortController`), щоб уникнути витоків пам'яті й дубльованих обробників, що часто трапляється в SPA.

```js
const controller = new AbortController();
window.addEventListener("resize", onResize, { signal: controller.signal });
controller.abort(); // знімає обробник
```

## Чек-лист для співбесіди

- Поясніть занурення й спливання, а також `target` проти `currentTarget`.
- Реалізуйте делегування подій через `closest`.
- Порівняйте `preventDefault` і `stopPropagation`.
- Використовуйте `textContent` для неперевірених рядків і уникайте layout thrashing.
