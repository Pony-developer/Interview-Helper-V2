---
skill: responsive-design
title: "Responsive design: layouts that work on every screen"
summary: "The viewport meta tag, mobile-first media queries, fluid layouts with Flexbox and Grid, container queries, relative units and clamp(), responsive images with srcset and sizes, touch targets, and how to test across devices."
readingMinutes: 8
---

Responsive design means one codebase that adapts to any screen: a 320 px phone, a tablet in portrait, a 4K monitor, or a browser zoomed to 200%. The goal isn't to match a few device sizes, but to make layouts **fluid** and add adjustments only where the content starts to break.

## The viewport tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Without it, mobile browsers render the page at a virtual width of about 980 px and zoom out, so media queries never match "mobile". Never disable user zoom (`user-scalable=no`): it fails accessibility guidelines.

## Mobile-first media queries

Write the base styles for the smallest screen, then add complexity as space grows:

```css
.cards { display: grid; gap: 1rem; }
@media (min-width: 40rem) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 64rem) { .cards { grid-template-columns: repeat(3, 1fr); } }
```

- Choose **breakpoints from the content** (where the line length or layout breaks), not from device lists.
- Use `em`/`rem` breakpoints so they scale with the user's font size.
- Media features go beyond width: `prefers-color-scheme`, `prefers-reduced-motion`, `hover: hover` and `pointer: coarse` (touch).

## Fluid layout without breakpoints

Modern CSS often needs no media query at all:

```css
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); }
.sidebar-layout { display: flex; flex-wrap: wrap; }
.sidebar-layout > main { flex: 1 1 30rem; }  /* wraps under the sidebar when narrow */
```

`minmax`, `auto-fill`/`auto-fit`, `flex-wrap` and `flex-basis` let the browser decide how many columns fit.

## Container queries

Media queries ask about the **viewport**; components care about **their own space**. A card in a narrow sidebar and the same card in a wide main column need different layouts:

```css
.card-list { container-type: inline-size; }
@container (min-width: 30rem) { .card { display: grid; grid-template-columns: 8rem 1fr; } }
```

Container query units (`cqi`) size things relative to the container.

## Units and fluid typography

- `rem` for font sizes and spacing respects the user's browser font setting; `px` doesn't scale with it.
- `%`, `fr`, `vw`/`vh` for proportions. On mobile, `100vh` includes the area behind the browser's address bar; use `100dvh` (dynamic) or `svh`/`lvh`.
- `clamp(min, preferred, max)` gives fluid sizes with limits: `font-size: clamp(1rem, 0.9rem + 1vw, 1.5rem)`.
- Keep text measure readable: `max-width: 65ch`.

## Responsive images

```html
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(min-width: 64rem) 50vw, 100vw"
     width="1600" height="900" alt="…" loading="lazy" />
```

`srcset` lists the candidates and `sizes` tells the browser how wide the image will be displayed, so it downloads the smallest file that's sharp enough for the screen's pixel density. Use `<picture>` for **art direction** (a different crop on mobile) or modern formats (AVIF/WebP with fallbacks). Always set `width`/`height` (or `aspect-ratio`) to prevent layout shift.

## Touch and input

- Touch targets at least about 44 × 44 CSS px (WCAG 2.2 asks for 24 × 24 minimum).
- Don't hide essential actions behind `:hover`; use `@media (hover: hover)` for hover-only enhancements.
- Use the right input types (`type="email"`, `inputmode="numeric"`) for better mobile keyboards.

## Testing

Browser device emulation is a good start, but test on real phones too (touch, performance, the virtual keyboard covering inputs). Check 320 px width, landscape, 200% zoom and large system font sizes: content should reflow without horizontal scrolling (WCAG "Reflow").

## Interview checklist

- Explain the viewport meta tag and mobile-first media queries.
- Build a responsive grid without media queries (`auto-fill` + `minmax`).
- Compare media queries and container queries.
- Explain `srcset`/`sizes`, `<picture>`, and preventing layout shift.
- Know `rem` vs `px`, `clamp()`, and `dvh`.
