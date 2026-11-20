---
skill: solid
title: "SOLID principles with frontend examples"
summary: "Single responsibility, open/closed, Liskov substitution, interface segregation and dependency inversion, shown in TypeScript and React, plus DRY, KISS, YAGNI and how to avoid over-engineering."
readingMinutes: 8
---

SOLID is five design principles for code that's easy to change. They were written for classes, but they apply just as well to functions, modules, hooks and components. Treat them as heuristics for spotting problems, not rules to apply everywhere.

## S: Single responsibility

A module should have **one reason to change**: it serves one actor or concern.

```tsx
// ✗ fetches, validates, formats money, tracks analytics and renders
function InvoicePage() { /* 300 lines */ }

// ✓ each piece changes for its own reason
const invoice = useInvoice(id);          // data fetching
const rows = toInvoiceRows(invoice);     // pure formatting, easy to test
return <InvoiceTable rows={rows} />;     // presentation
```

The test: list the reasons the code might change (API format, currency rules, design). If one file changes for all of them, split it.

## O: Open/closed

Code should be **open for extension, closed for modification**: adding a feature shouldn't require editing working code in many places. A `switch (method)` repeated across five files breaks it; a registry of strategies (`paymentMethods[method].charge()`), props like `renderItem`, or plugin hooks keep the core untouched.

## L: Liskov substitution

A subtype must be usable **anywhere** its base type is expected, without callers noticing. The classic violation is `Square extends Rectangle`: code that sets width and height independently breaks. Subclasses must not:

- demand more of their inputs (throw for arguments the base accepted),
- promise less in their outputs (return `null` where the base never did),
- throw "not supported" for inherited methods.

If a subclass can't honour the contract, it shouldn't be a subclass.

## I: Interface segregation

Clients shouldn't depend on methods they don't use. Prefer several small, focused interfaces to one fat one:

```ts
interface Readable<T> { get(id: string): Promise<T | undefined> }
interface Writable<T> { save(item: T): Promise<void> }
function ProfileCard(props: { user: Pick<User, "name" | "avatarUrl"> }) { … }
```

A component that takes only the fields it renders is easier to reuse and test than one that requires the whole `User` object.

## D: Dependency inversion

High-level policy shouldn't depend on low-level details; **both depend on abstractions**. Instead of `new PostgresRepo()` inside a service, accept a `ReportRepo` interface, and wire the concrete implementation at the edge (an Angular provider, a React context, a factory in `main.ts`). Tests pass fakes; production can switch storage without touching business logic.

## DRY, KISS, YAGNI

- **DRY** (Don't Repeat Yourself) is about duplicated *knowledge*, not similar-looking code. Two identical snippets that change for different reasons should stay separate.
- **KISS**: prefer the simplest design that works.
- **YAGNI** (You Aren't Gonna Need It): don't add interfaces, factories and options for hypothetical futures. Introduce an abstraction when a second implementation or a test seam actually needs it.

## Interview checklist

- State each principle in one sentence and give a frontend example.
- Explain why `Square extends Rectangle` violates LSP.
- Show how a strategy registry satisfies open/closed.
- Explain dependency inversion and how it makes code testable.
- Argue against over-applying SOLID with YAGNI.
