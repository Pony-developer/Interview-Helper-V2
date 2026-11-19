---
skill: rxjs
title: "RxJS: observables, operators and higher-order mapping"
summary: "Observables vs promises, cold vs hot streams, Subjects, the four flattening operators, and how to avoid leaks with proper unsubscription."
readingMinutes: 8
---

RxJS models values over time as **observables**. It's central to Angular (HttpClient, forms, router) and handy anywhere events, timers and requests interact.

## Observable vs promise

| | Promise | Observable |
| --- | --- | --- |
| Values | one | zero to many |
| Laziness | starts immediately | starts on `subscribe` |
| Cancellation | no (AbortController aside) | `unsubscribe()` |
| Operators | `then`/`catch` | dozens: `map`, `filter`, `debounceTime`… |

```ts
const ticks$ = interval(1000).pipe(take(3), map((n) => n * 10));
const sub = ticks$.subscribe({ next: console.log, complete: () => console.log("done") });
// 0, 10, 20, done
```

## Cold vs hot

- **Cold** observables (`of`, `interval`, `HttpClient.get`) start a new producer for **each** subscriber. Two `async` pipes on one HTTP observable mean two requests.
- **Hot** observables (DOM events, Subjects) share one producer.
- `share()` / `shareReplay({ bufferSize: 1, refCount: true })` turn cold into shared.

## Subjects

A Subject is both observable and observer: you `next()` values into it.

- `Subject`: no initial value, and late subscribers miss past values.
- `BehaviorSubject`: has a current value, and new subscribers get it immediately. A simple store.
- `ReplaySubject(n)`: replays the last n values.

Expose `subject.asObservable()` publicly, so outsiders can't push values.

## Higher-order mapping: the key interview topic

When each value starts an inner observable (often a request), choose how to flatten:

| Operator | Behaviour | Typical use |
| --- | --- | --- |
| `switchMap` | cancels the previous inner observable | typeahead search, route params |
| `mergeMap` | runs all in parallel | independent saves, analytics |
| `concatMap` | queues, one at a time in order | ordered writes |
| `exhaustMap` | ignores new values while busy | "Submit" button, login |

A classic typeahead:

```ts
const results$ = query$.pipe(
  map((q) => q.trim()),
  debounceTime(300),
  distinctUntilChanged(),
  filter((q) => q.length >= 2),
  switchMap((q) => search(q).pipe(catchError(() => of([])))),
);
```

Put `catchError` **inside** `switchMap`. An error in the outer stream completes it, and the search stops working.

## Unsubscribing

Infinite streams (intervals, events, store selections) keep callbacks and components alive until you unsubscribe:

- prefer the `async` pipe in Angular templates;
- `takeUntilDestroyed()` (Angular 16+) or `takeUntil(destroy$)`;
- finite streams (HTTP, `take(1)`, `first()`) complete on their own.

## Combining streams

`combineLatest` (latest of each, after all emitted), `withLatestFrom` (sample others when the main one emits), `forkJoin` (last values when all complete, like `Promise.all`), `merge` (interleave).

## Interview checklist

- Contrast observables with promises, and cold with hot streams.
- Pick between switchMap, mergeMap, concatMap and exhaustMap.
- Build a typeahead with debounce, distinct and cancellation.
- Explain how you avoid subscription leaks.
