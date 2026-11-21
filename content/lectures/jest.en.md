---
skill: jest
title: "Jest: writing reliable unit tests"
summary: "Test structure and matchers, mocks, spies and module mocks, fake timers, testing asynchronous code, snapshot tests and their pitfalls, coverage as a signal rather than a goal, and how to keep a test suite fast and trustworthy."
readingMinutes: 9
---

Jest is the most widely used JavaScript test runner. It finds test files, runs them in parallel, provides `expect` matchers and mocking, and reports results. Writing tests that catch real bugs, and don't break when code is refactored, is a skill of its own, and most of the advice below is about that.

## Structure and matchers

```js
describe("applyDiscount", () => {
  it("takes the percentage off the price", () => {
    expect(applyDiscount(200, 25)).toBe(150);
  });
  it("never returns a negative price", () => {
    expect(applyDiscount(10, 150)).toBe(0);
  });
});
```

Use `toBe` for primitives (it compares with `Object.is`) and `toEqual` for objects and arrays (it compares structure, ignoring `undefined` properties). `toStrictEqual` also checks for `undefined` properties and class types. Test the **behaviour** (inputs and outputs), not the implementation: a test that asserts on private helper calls breaks every time the code is reorganised.

## Mocks and spies

- `jest.fn()` creates a mock function that records its calls. Pass one as a callback and assert on `toHaveBeenCalledWith(…)`.
- `jest.spyOn(object, "method")` wraps an existing method, so you can observe it and optionally replace it.
- `jest.mock("./module")` replaces a whole module for the test file. Use it for external boundaries (network, payment providers, the clock), not for the code you're trying to test.

Over-mocking is a common failure: when everything is mocked, the test only proves that the mocks agree with each other. Prefer real implementations for pure logic, and mock only what is slow, random or external.

## Time and asynchronous code

`jest.useFakeTimers()` lets a test move time forward with `jest.advanceTimersByTime(ms)`, so a 30-second retry delay takes no real time. Await promises in tests (`await expect(promise).resolves.toBe(…)`, or `rejects.toThrow`), and return or await every promise, or the test passes before the assertion runs. Mocks of `Date` and `Math.random` should be restored after each test (`afterEach(() => jest.restoreAllMocks())`).

## Snapshots

`toMatchSnapshot` stores a serialised value on the first run and compares later runs against it. They're useful for stable output such as a generated configuration, but large snapshots get updated blindly (`-u`) and stop catching anything. Prefer explicit assertions on the parts that matter.

## Coverage

`jest --coverage` reports which lines ran. It shows what is **not** tested, not whether the tests are good: a test that calls a function without asserting on the result gives full coverage and no protection. Use coverage to find untested code paths, and set thresholds only on code that is stable.

## Keeping the suite useful

- Keep tests independent: each test sets up its own data, and none depends on the order of others.
- Make failures readable: a good test name says what behaviour broke.
- Fix or delete flaky tests quickly. A suite everyone reruns until it passes teaches people to ignore red builds.
- Keep unit tests fast (milliseconds) and move slow checks into integration or end-to-end suites.

## Interview checklist

- Write a `describe`/`it` suite with `toBe` and `toEqual`, and explain when each applies.
- Explain `jest.fn`, `jest.spyOn` and `jest.mock`, and when mocking hurts.
- Test a function that waits 30 seconds using fake timers.
- Explain what coverage does and doesn't prove.
- Describe how you keep a test suite fast and trustworthy.
