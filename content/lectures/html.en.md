---
skill: html
title: "Semantic HTML: structure, forms and the parsing model"
summary: "Why the right element matters, document landmarks, accessible forms, and how browsers parse and load HTML, scripts and styles."
readingMinutes: 9
---

HTML gives content meaning. Browsers, search engines and assistive technology all read that meaning, so choosing the right element is a feature, not decoration.

## Semantic structure

```html
<header>…logo, site navigation…</header>
<nav aria-label="Main">…</nav>
<main>
  <article>
    <h1>Page title</h1>
    <section aria-labelledby="pricing">
      <h2 id="pricing">Pricing</h2>
    </section>
  </article>
  <aside>…related links…</aside>
</main>
<footer>…</footer>
```

- Use **one `<h1>`** per page and don't skip heading levels: screen-reader users navigate by headings.
- Landmarks (`header`, `nav`, `main`, `aside`, `footer`) let users jump between regions.
- Use `<button>` for actions and `<a href>` for navigation. A `<div onclick>` isn't focusable, has no role and ignores Enter/Space.
- Use `<ul>`/`<ol>` for lists, `<table>` with `<th scope>` for tabular data (never for layout), and `<time datetime>` for dates.

## Forms

```html
<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required
         aria-describedby="email-hint" />
  <p id="email-hint">We'll never share it.</p>

  <fieldset>
    <legend>Plan</legend>
    <label><input type="radio" name="plan" value="free" /> Free</label>
    <label><input type="radio" name="plan" value="pro" /> Pro</label>
  </fieldset>

  <button type="submit">Sign up</button>
</form>
```

- Every control needs a **label**. A placeholder is not a label: it disappears as you type.
- The right `type` (`email`, `tel`, `number`, `date`) brings mobile keyboards and built-in validation. `autocomplete` speeds up filling.
- `<button>` inside a form defaults to `type="submit"`, so give other buttons `type="button"`.
- Group related radios and checkboxes with `<fieldset>` and `<legend>`.

## How the browser loads a page

1. HTML is parsed top to bottom into the DOM.
2. A classic `<script>` **blocks parsing** until it is downloaded and executed.
3. `<script defer>` downloads in parallel and runs after parsing, in order. `<script async>` runs as soon as it's downloaded, in any order. `type="module"` scripts are deferred by default.
4. CSS blocks **rendering** (not parsing), because the browser needs styles before painting.

Put critical CSS in the head, use `defer` for app scripts, and lazy-load below-the-fold images with `loading="lazy"`.

## Metadata that matters

`<html lang>`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, a unique `<title>` and meta description, plus `alt` text on every meaningful image (`alt=""` for decorative ones).

## Going deeper

**Native dialogs.** `dialog.showModal()` puts the dialog in the top layer with a `::backdrop`, makes the rest of the page inert and closes on Escape. `show()` opens a plain, non-modal dialog. A `<form method="dialog">` inside closes it on submit.

**Responsive images.** `srcset` lists candidates by width (`hero-960.jpg 960w`) and `sizes` tells the browser how wide the slot will be (`(min-width: 800px) 50vw, 100vw`). The browser multiplies the slot by the device pixel ratio and picks the smallest file that covers it. Without `sizes` it assumes 100vw and over-downloads.

**Loading priority.** Keep the LCP image as a real `<img>` in the HTML so the preload scanner finds it early, and add `fetchpriority="high"`. Use `<link rel="preload">` for critical resources discovered late (such as CSS backgrounds or fonts), and never lazy-load the hero.

## Interview checklist

- Replace clickable divs with buttons and links, and explain why.
- Build a labelled form with correct input types.
- Explain `defer` vs `async`.
- Describe landmarks and heading order for accessibility and SEO.
