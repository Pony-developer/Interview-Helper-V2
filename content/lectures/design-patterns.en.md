---
skill: design-patterns
title: "Design patterns a frontend developer actually uses"
summary: "Creational, structural and behavioural patterns through everyday JavaScript: module singletons, factories, Observer, Strategy, Decorator, Adapter, Facade, Proxy, Command and middleware chains, plus dependency injection and when a pattern is overkill."
readingMinutes: 9
---

A design pattern is a **named, reusable solution to a recurring design problem**. The value is the shared vocabulary: "make it a strategy" or "that's an adapter" says a lot in a few words. In JavaScript many classic (Gang of Four) patterns shrink to a function or an object literal, so interviewers care more about *recognising* them and their trade-offs than about UML.

## Creational: how objects are made

- **Singleton.** One shared instance. In JS an ES module is evaluated once, so `export const api = new ApiClient()` is already a singleton. The downside is hidden global state, which makes tests leak into each other; prefer passing the instance in.
- **Factory.** A function that decides which object to create: `createLogger(env)` returns a console logger in development and a remote one in production. Callers depend on the interface, not the concrete class.
- **Builder.** Assemble a complex object step by step (`new QueryBuilder().where(...).limit(10).build()`).

## Structural: how objects fit together

- **Adapter.** Converts one interface into the one your code expects, e.g. wrapping two analytics SDKs behind the same `track(event, props)`.
- **Facade.** A simple front for a complicated subsystem: one `uploadAvatar(file)` that resizes, requests a signed URL and uploads.
- **Decorator.** Adds behaviour by **wrapping** without changing the original: `withRetry(fetchJson)`, React higher-order components, TypeScript/Angular `@decorators`. Wrappers compose (`withCache(withRetry(fetchJson))`), whereas a subclass per combination explodes.
- **Proxy.** Stands in for an object to control access. JavaScript's built-in `Proxy` intercepts reads and writes; Vue's reactivity and MobX are built on it.

```ts
const withRetry = <A extends unknown[], R>(fn: (...a: A) => Promise<R>, times = 3) =>
  async (...args: A): Promise<R> => {
    for (let i = 1; ; i++) {
      try { return await fn(...args); } catch (e) { if (i >= times) throw e; }
    }
  };
```

## Behavioural: how objects communicate

- **Observer / pub-sub.** Subjects notify subscribers: DOM events, `EventEmitter`, RxJS, store subscriptions. Always provide (and call) an unsubscribe, or you leak memory; and iterate over a copy of the listener list in case a listener unsubscribes while being notified.
- **Strategy.** Swap an algorithm behind a common interface. A map of functions replaces a growing `switch`:

```ts
const shipping: Record<Method, (order: Order) => number> = {
  standard: (o) => 5,
  express: (o) => 15,
  free: () => 0,
};
const cost = shipping[order.method](order);
```

- **Command.** Wrap an action as an object with `execute` and `undo`. Keeping executed commands on a stack gives you undo/redo, queues and macros.
- **Chain of responsibility / middleware.** A request passes through a list of handlers, each deciding to handle it, change it or call `next()`: Express and Koa middleware, Redux middleware, HTTP interceptors.
- **Iterator.** A uniform way to walk a collection: `Symbol.iterator`, generators, `for…of`.

## Dependency injection

Instead of creating its own collaborators, a class receives them: `constructor(private http: HttpClient)`. Angular has a DI container built in; in React, context and props play the same role. The win is testability (pass a fake) and swappable implementations. It's the "D" in SOLID: depend on abstractions, not concretions.

## When not to use a pattern

Patterns add indirection. A strategy map for two cases or a factory that only ever returns one class is noise. Reach for a pattern when the problem it solves is real (a third shipping method is coming, the SDK really might change), and name it in code review so the intent is clear.

## Interview checklist

- Recognise Observer, Strategy, Decorator, Adapter, Facade, Proxy, Command and middleware in real APIs.
- Explain why module-level singletons hurt testing and how DI helps.
- Describe how to implement undo/redo with commands.
- Explain the difference between Adapter (change the interface) and Facade (simplify a subsystem).
