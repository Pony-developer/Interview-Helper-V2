---
skill: web-performance
title: "Web performance: Core Web Vitals, rendering and loading"
summary: "What LCP, INP and CLS measure, how the rendering pipeline works, and the techniques that actually move the numbers: less JavaScript, smarter loading, debouncing."
readingMinutes: 8
---

Performance is user experience. Interviewers expect you to know what to measure, why pages get slow, and which fixes matter.

## Core Web Vitals

| Metric | Measures | Good |
| --- | --- | --- |
| **LCP**, Largest Contentful Paint | when the main content appears | ≤ 2.5 s |
| **INP**, Interaction to Next Paint | how quickly the page responds to input | ≤ 200 ms |
| **CLS**, Cumulative Layout Shift | how much content jumps around | ≤ 0.1 |

Measure with real-user data (CrUX, `web-vitals` library) and diagnose with Lighthouse and the DevTools Performance panel.

## The rendering pipeline

JavaScript → **Style** → **Layout** → **Paint** → **Composite**.

- Changing `width`, `top` or fonts triggers layout, the most expensive step.
- Changing colours triggers paint.
- `transform` and `opacity` can be handled by the compositor alone, so animate those.
- Long tasks (>50 ms) on the main thread block input, which hurts INP. Split work, yield (`await scheduler.yield()` or `setTimeout`), or move it to a Web Worker.

## Loading faster (LCP)

- Ship less JavaScript: code-split routes and heavy widgets (`import()`), tree-shake, and drop unused dependencies.
- Prioritise the hero: `<link rel="preload">` its image, `fetchpriority="high"`, modern formats (AVIF/WebP), responsive `srcset`.
- Render HTML on the server or statically (SSR/SSG) so content doesn't wait for JS.
- Cache aggressively with fingerprinted assets and a CDN. Use `font-display: swap` and preconnect to critical origins.
- Lazy-load below-the-fold images and iframes (`loading="lazy"`).

## Avoiding layout shift (CLS)

Reserve space: set `width`/`height` (or `aspect-ratio`) on images and embeds, keep skeletons the same size as the content, and never insert banners above existing content.

## Doing less work

**Debounce** waits until events stop (search input, resize). **Throttle** runs at most once per interval (scroll position, mouse move):

```js
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
```

In frameworks, avoid unnecessary re-renders (memoise expensive subtrees, keep state local), and virtualise long lists so only the visible rows render.

## Memory

Leaks come from forgotten listeners, timers, detached DOM nodes held in closures, and ever-growing caches. Use the Memory panel's heap snapshots to find them.

## Interview checklist

- Name and explain LCP, INP and CLS.
- Explain why `transform` animations are cheaper than `top`/`left`.
- List concrete loading optimisations for the largest element.
- Implement debounce and throttle, and say when to use each.
