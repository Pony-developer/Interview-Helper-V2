---
skill: css
title: "CSS that interviewers ask about: cascade, box model, Flexbox and Grid"
summary: "How the cascade and specificity decide which rule wins, the box model, positioning and stacking, and when to use Flexbox or Grid."
readingMinutes: 8
---

CSS questions test whether you can predict what the browser will do, not whether you memorised properties.

## The cascade and specificity

When several rules set the same property, the browser picks the winner by:

1. **Origin and importance**: `!important` user-agent/user/author rules, then normal rules.
2. **Cascade layers** (`@layer`): later layers win over earlier ones.
3. **Specificity**: `(ids, classes/attributes/pseudo-classes, elements)`.
4. **Source order**: the last declaration wins.

| Selector | Specificity |
| --- | --- |
| `p` | (0,0,1) |
| `.card p` | (0,1,1) |
| `#main .card p` | (1,1,1) |
| `a:hover` | (0,1,1) |
| `:where(.x) p` | (0,0,1): `:where` adds nothing |

Inline styles beat all selectors. Prefer low, flat specificity (single classes) so overrides stay predictable.

## The box model

Each element is content + padding + border + margin. With the default `box-sizing: content-box`, `width` sets only the content box, so padding and border make the element wider. Most resets use:

```css
*, *::before, *::after { box-sizing: border-box; }
```

Vertical margins of adjacent blocks **collapse** (the larger one wins). Flex and grid items don't collapse margins.

## Positioning and stacking

- `relative`: offset from its normal place, and becomes the containing block for absolute children.
- `absolute`: removed from flow and placed relative to the nearest positioned ancestor.
- `fixed`: relative to the viewport. `sticky`: sticks within its scroll container.
- `z-index` only compares elements within the same **stacking context**. `opacity < 1`, `transform`, `filter` and `position` with a z-index all create new contexts, which explains the classic "my z-index: 9999 doesn't work".

## Flexbox: one dimension

```css
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
```

`justify-content` works on the main axis, `align-items` on the cross axis. `flex: 1` lets items share the free space. Use Flexbox for rows of controls, nav bars and centring.

## Grid: two dimensions

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
}
```

Grid controls rows and columns together. `auto-fill` + `minmax` gives responsive columns without media queries. Use Grid for page layouts and card galleries.

## Responsive and modern CSS

- Mobile-first media queries (`min-width`), relative units (`rem`, `%`, `vw`) and `clamp()` for fluid type.
- Container queries (`@container`) adapt components to their own width.
- Custom properties (`--brand: #0b5a43`) cascade and can change at runtime.
- Visually hidden text for screen readers: clip it with `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`. Never use `display: none`, which hides it from assistive technology too.

## Interview checklist

- Calculate specificity and explain why a rule doesn't apply.
- Explain `border-box`, margin collapsing and stacking contexts.
- Choose Flexbox vs Grid, and centre anything both ways.
- Hide content visually without hiding it from screen readers.
