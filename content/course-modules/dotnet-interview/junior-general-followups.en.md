After your first answer, interviewers dig one level deeper. Here are the follow-ups that most often come after questions 1–12, with short answers.

## OOP

- **"What's the difference between OOP and procedural programming?"** Procedural code is a set of functions operating on data passed around; OOP bundles data with the behaviour that protects it, so invariants live in one place and objects can be swapped through polymorphism.
- **"Composition or inheritance?"** Composition by default. Inheritance couples the subclass to every detail of the base class (the "fragile base class" problem); composition lets you combine behaviours and replace parts at run time.
- **"Can a constructor be virtual? Can you call a virtual method from a constructor?"** Constructors aren't virtual. You *can* call a virtual method from a base constructor in C#, but the derived override runs before the derived constructor body — fields it relies on aren't initialized yet. Avoid it.
- **"What's the difference between an abstract method and a virtual one?"** Abstract has no body and must be overridden; virtual has a default body and may be overridden.

## Recursion and lambdas

- **"Write factorial / Fibonacci recursively. What's the complexity?"** Naive recursive Fibonacci is O(2ⁿ) because it recomputes the same values; memoization or a loop makes it O(n).
- **"What does a lambda capture?"** Variables, not values. All closures created in one scope share the captured variable; since C# 5, a `foreach` variable is fresh per iteration, but a `for` loop variable is not.
- **"What's an expression-bodied member?"** `public int Area => W * H;` — syntax, unrelated to lambdas at run time.

## Multithreading

- **"What's a race condition?"** The result depends on the timing of threads, e.g. two threads doing `count++` lose updates. Fix with `lock`, `Interlocked.Increment` or by not sharing state.
- **"What is a deadlock?"** Two threads each hold a lock and wait for the other's. Avoid by taking locks in a fixed order, holding them briefly, and never blocking on async code.
- **"Thread vs Task?"** A `Thread` is an OS thread you manage; a `Task` is a unit of work (often run on the thread pool, or representing I/O with no thread at all) with results, exceptions, continuations and cancellation.

## Web

- **"What's the difference between PUT and PATCH?"** PUT replaces the whole resource (idempotent); PATCH changes part of it (JSON Patch / merge patch).
- **"What is CORS?"** A browser rule: a page from origin A can call an API on origin B only if B's response allows it (`Access-Control-Allow-Origin`). The server opts in.
- **"Cookies vs tokens?"** Cookies are sent automatically by the browser (need CSRF protection, `HttpOnly`, `Secure`, `SameSite`); bearer tokens are sent explicitly in the `Authorization` header (stored by the client app).
- **"What is idempotency?"** Doing the same request twice has the same effect as once — important for retries.

## Docker and tests

- **"Container vs virtual machine?"** A VM virtualizes hardware and runs its own OS kernel; a container is an isolated process on the host kernel — lighter, starts in milliseconds, weaker isolation.
- **"How would you test code that calls an external API?"** Hide it behind an interface and fake it in unit tests; test the real HTTP integration separately with a stub server (WireMock.Net) or a fake `HttpMessageHandler`.
- **"What's code coverage good for?"** Finding untested code — not proving correctness. 80% coverage with meaningful asserts beats 100% with none.

The practice after the quiz builds a tiny REST router, so you can see 200, 404 and 405 come out of real code.
