A pattern solves a problem. An **anti-pattern** is a common "solution" that looks reasonable but causes more problems than it solves. Knowing them is as useful as knowing the patterns, and interviewers like to ask about them.

## Classic anti-patterns

**God object.** One class that knows and does everything: `OrderManager` with 5,000 lines that validates, saves, emails and calculates taxes. Every change touches it, and nobody understands it whole. *Fix:* split by responsibility (single responsibility principle).

**Singleton abuse.** Global state everywhere: `AppState.Instance.CurrentUser`, `Cache.Instance`, `Db.Instance`. Classes hide their dependencies, tests interfere with each other. *Fix:* dependency injection with the right lifetime.

**Service Locator in business code.** `var repo = ServiceLocator.Get<IRepository>();` inside methods. You can't tell from the constructor what a class needs, and a missing registration fails only at runtime. *Fix:* constructor injection.

**Spaghetti code and copy-paste.** The same logic copied into ten places, each copy drifting a bit. *Fix:* extract it, and maybe that's where a Template Method or Strategy appears naturally.

**Golden hammer.** "I learned the Repository pattern, so everything gets a repository." Using one favorite tool for every problem. *Fix:* start from the problem, not from the pattern.

**Magic numbers and strings.** `if (status == 3)`, `"new_customfield"` typed in twenty places. *Fix:* constants and enums.

## Overengineering: patterns where they aren't needed

Signs you've added a pattern too early:

- an interface for every class, each with exactly one implementation "just in case";
- a factory that always creates the same class;
- an abstract base class with one subclass;
- five layers of wrappers (controller → service → manager → handler → repository) to save one record;
- a new teammate needs a day to find where the code actually *does* something.

Every pattern costs extra classes and indirection. It pays off only when the flexibility it buys is actually used.

## A healthy rule: the rule of three

Write the simple version first. When the same kind of change comes a **second** time, notice it. On the **third** time, refactor toward a pattern. By then you know what really varies, so the abstraction fits the real problem rather than a guessed one. (Related principles: **YAGNI**, "You Aren't Gonna Need It", and **KISS**, "Keep It Simple".)

## Remember

Good code isn't "code with many patterns"; it's code that's easy to change where it actually changes. Patterns are a tool for that, and an anti-pattern is what happens when the tool becomes the goal.
