---
skill: web-accessibility
title: "Web accessibility: WCAG, semantics, keyboard and ARIA"
summary: "The principles behind WCAG, why native HTML beats ARIA, keyboard and focus management, accessible names, contrast and how to test."
readingMinutes: 8
---

Accessibility (a11y) means people can use your product with screen readers, keyboards, switch devices, zoom or in bright sunlight. It's a legal requirement in many markets (the European Accessibility Act, ADA) and a quality signal in interviews.

## WCAG in one minute

WCAG 2.2 organises requirements under **POUR**: Perceivable, Operable, Understandable, Robust. Level **AA** is the usual target. Typical AA checks:

- Text contrast at least **4.5:1** (3:1 for large text and UI component boundaries).
- Everything works with the **keyboard**, with a visible focus indicator.
- Every image has a text alternative; every form control has a label.
- No information conveyed by colour alone.
- Content reflows at 320 px width and 200% zoom without horizontal scrolling.
- Target size at least 24×24 px (2.2).

## The first rule of ARIA

**Don't use ARIA if a native element does the job.** A `<button>` is focusable, has the right role and handles Enter and Space. A `<div role="button">` needs `tabindex="0"` and key handlers to catch up. ARIA only changes what assistive technology *announces*; it adds no behaviour.

When you do build custom widgets (tabs, combobox, disclosure), follow the ARIA Authoring Practices patterns:

```html
<button aria-expanded="false" aria-controls="faq-1">Shipping</button>
<div id="faq-1" hidden>…</div>
```

Toggle buttons use `aria-pressed`, disclosures `aria-expanded`, current navigation items `aria-current="page"`.

## Accessible names

Every interactive element needs a name:

- Visible text content (`<button>Save</button>`),
- `<label for>` for inputs,
- `aria-label` / `aria-labelledby` for icon-only controls,
- `alt` for images (`alt=""` for decorative ones).

The visible label should be part of the accessible name (WCAG 2.5.3, "label in name"), so voice-control users can say what they see.

## Keyboard and focus

- Tab order follows the DOM order, so keep visual and DOM order aligned. Avoid positive `tabindex`.
- Never remove focus outlines without a replacement: style `:focus-visible` instead.
- Modals: move focus in, trap it, close on Escape, and return focus to the trigger. The native `<dialog>` with `showModal()` does most of this.
- Provide a "skip to content" link and landmarks.

## Dynamic content

Announce changes with live regions: `aria-live="polite"` for status messages, `role="alert"` for errors. Move focus deliberately after route changes in SPAs.

## Motion and preferences

Respect `prefers-reduced-motion`, don't auto-play animations longer than 5 seconds without a pause control, and never flash more than three times per second.

## Testing

Automated tools (axe, Lighthouse) catch about a third of issues. Then test manually: navigate with the keyboard only, use a screen reader (VoiceOver, NVDA), zoom to 200%, and check contrast.

## Interview checklist

- State the first rule of ARIA and give an example.
- Make an icon-only button and a custom toggle accessible.
- Explain focus management for a modal.
- Describe how you'd test a page for accessibility.
