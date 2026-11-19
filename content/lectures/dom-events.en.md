---
skill: dom-events
title: "DOM and events: propagation, delegation and default actions"
summary: "How events travel through the DOM, how delegation keeps handlers cheap and dynamic, and how to query and update the DOM efficiently."
readingMinutes: 7
---

Frameworks hide the DOM, but interviewers still expect you to know what they do underneath, especially how events flow.

## Querying and updating

```js
const list = document.querySelector("#todo");          // first match or null
const items = document.querySelectorAll(".item");     // static NodeList
const li = document.createElement("li");
li.textContent = userInput;                             // safe: no HTML parsing
list.append(li);
```

- Use `textContent` for user data. `innerHTML` parses HTML and opens the door to **XSS**.
- Batch DOM writes. Reading layout (`offsetHeight`, `getBoundingClientRect`) right after writing forces a synchronous reflow ("layout thrashing").
- `classList.toggle("open", isOpen)` and `dataset.id` are cleaner than string manipulation.

## Event propagation

An event travels in three phases:

1. **Capture**: from `window` down to the target's parent.
2. **Target**: on the element that was clicked.
3. **Bubble**: back up to `window`.

```js
el.addEventListener("click", handler);                    // bubbling phase (default)
el.addEventListener("click", handler, { capture: true }); // capture phase
el.addEventListener("scroll", onScroll, { passive: true }); // promise not to preventDefault
el.addEventListener("click", once, { once: true });        // auto-removed after first call
```

- `event.target` is the element where the event started. `event.currentTarget` is the element whose listener is running.
- `stopPropagation()` stops the journey. Use it sparingly, because it breaks delegation and analytics higher up.
- `preventDefault()` cancels the browser's default action (following a link, submitting a form, checking a box). It does not stop propagation.

Not every event bubbles: `focus`/`blur` don't (use `focusin`/`focusout`), and neither do `mouseenter`/`mouseleave`.

## Event delegation

Instead of one listener per item, attach **one** listener to a container and find the item from `event.target`:

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("button.delete");
  if (!button || !list.contains(button)) return;
  removeTodo(button.closest("li").dataset.id);
});
```

Benefits: fewer listeners, and items added later work automatically. `closest` handles clicks on icons or spans inside the button.

## Cleaning up

Remove listeners you no longer need (`removeEventListener` with the same function reference, or an `AbortController` signal) to avoid leaks and duplicated handlers, which is common in SPAs.

```js
const controller = new AbortController();
window.addEventListener("resize", onResize, { signal: controller.signal });
controller.abort(); // removes it
```

## Interview checklist

- Explain capture vs bubble, and `target` vs `currentTarget`.
- Implement event delegation with `closest`.
- Contrast `preventDefault` and `stopPropagation`.
- Use `textContent` for untrusted strings and avoid layout thrashing.
