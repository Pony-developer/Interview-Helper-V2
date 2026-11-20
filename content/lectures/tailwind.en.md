---
skill: tailwind
title: "Tailwind CSS: utility-first styling in practice"
summary: "What utility-first means and why teams choose it, variants for responsive, state and dark mode, the design-token theme, how unused classes are removed, arbitrary values, extracting components instead of @apply everywhere, class merging, and the main trade-offs."
readingMinutes: 7
---

Tailwind is a **utility-first** CSS framework: instead of writing a `.card` class in a stylesheet, you compose small single-purpose classes directly in the markup.

```html
<article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md md:flex md:gap-6">
  <img class="size-24 rounded-full object-cover" src="…" alt="" />
  <h2 class="mt-4 text-lg font-semibold text-slate-900 md:mt-0">Ada Lovelace</h2>
</article>
```

## Why teams use it

- **No naming and no dead CSS.** You don't invent class names, and deleting markup deletes its styles.
- **Constraints.** Utilities come from a shared scale (spacing, colours, font sizes), so the UI stays consistent; the theme is your design tokens.
- **Local reasoning.** Everything that styles an element is visible on the element; changing one component can't break another through the cascade.
- **Small CSS.** The build scans your source files and generates only the classes you actually use.

The common criticisms: long class lists in markup, a learning curve for the naming, and HTML that's harder to read without editor support.

## Variants

Prefixes apply a utility conditionally:

| Variant | Meaning |
| --- | --- |
| `sm:` `md:` `lg:` | min-width breakpoints (mobile-first) |
| `hover:` `focus-visible:` `disabled:` | element states |
| `dark:` | dark mode (by media query or a class/attribute strategy) |
| `group-hover:` `peer-checked:` | state of a parent (`group`) or sibling (`peer`) |
| `@md:` | container queries (on an `@container` parent) |
| `motion-safe:` `print:` | other media features |

Variants stack: `md:dark:hover:bg-slate-800`.

## Theme and configuration

The design system lives in the theme: colours, spacing, fonts, breakpoints, shadows. In Tailwind v4 it's defined in CSS with `@theme { --color-brand-500: …; }`, which also exposes the values as CSS variables; v3 used `tailwind.config.js`. Extending the theme is better than scattering one-off values.

When you truly need a one-off, use **arbitrary values**: `top-[117px]`, `grid-cols-[1fr_2fr]`, `bg-[var(--hero)]`. Frequent arbitrary values are a sign the theme is missing something.

## How unused CSS disappears

Tailwind generates CSS by **scanning source files for class names as plain text**. That means class names must appear in full:

```js
// ✗ never generated: the scanner can't see "bg-red-500"
const cls = `bg-${color}-500`;
// ✓ map to complete class names
const cls = { red: "bg-red-500", green: "bg-green-500" }[color];
```

## Reuse without repeating yourself

- The main reuse mechanism is **components** (React, Vue, Angular) or template partials: the class list is written once in `<Button>`.
- `@apply` copies utilities into a custom class. It's fine for a few base styles or third-party markup, but using it everywhere recreates the naming and cascade problems Tailwind avoids.
- Components that accept a `className` prop need **conflict-aware merging**: `"px-4 px-2"` doesn't mean "last one wins" (CSS order decides, not class order). Libraries like `tailwind-merge` (often with `clsx`) resolve it; variant APIs such as `cva` organise size and intent variants.

## Accessibility and best practices

- Utilities don't make markup accessible: still use semantic elements, labels and visible focus (`focus-visible:ring-2`).
- `sr-only` hides text visually but keeps it for screen readers.
- Prefer theme colours with checked contrast; dark mode needs its own contrast check.
- Keep class order consistent (the official Prettier plugin sorts classes automatically).

## Interview checklist

- Explain utility-first and its trade-offs compared with BEM, CSS Modules or CSS-in-JS.
- Use responsive, state, `group`/`peer` and dark-mode variants.
- Explain why dynamically built class names don't work.
- Describe how to reuse styles (components vs `@apply`) and merge conflicting classes.
- Explain theme tokens and when arbitrary values are appropriate.
