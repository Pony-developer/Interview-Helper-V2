---
skill: unit-testing
title: "Unit testing: structure, test doubles and testing UI behaviour"
summary: "Arrange-act-assert, what makes a good test, mocks vs stubs vs fakes, testing async code and timers, and testing components through the user's eyes."
readingMinutes: 8
---

Good tests let you change code without fear. Interviewers look for tests that check **behaviour**, are fast and deterministic, and fail for one clear reason.

## Anatomy of a test

```ts
describe("formatPrice", () => {
  it("formats cents as a currency string", () => {
    // Arrange
    const cents = 123456;
    // Act
    const text = formatPrice(cents, "USD");
    // Assert
    expect(text).toBe("$1,234.56");
  });
});
```

- One behaviour per test, with a name that reads like a specification.
- Test edge cases: empty input, zero, negative numbers, boundaries, invalid data.
- Avoid logic (loops, ifs) in tests. Prefer `it.each` tables.

## The testing pyramid (or trophy)

Many fast **unit** tests for pure logic, a solid layer of **integration/component** tests, and a few **end-to-end** tests for critical journeys (Playwright, Cypress). Static types and linting catch a whole class of bugs for free.

## Test doubles

| Double | Purpose |
| --- | --- |
| **Stub** | returns canned answers (`getUser → { id: 1 }`) |
| **Mock / spy** | records calls so you can assert on them (`expect(send).toHaveBeenCalledWith(...)`) |
| **Fake** | a working lightweight implementation (in-memory repository) |

Design for testability by **injecting dependencies** (clock, HTTP client, storage) instead of importing them deep inside your code:

```ts
export function isExpired(token: Token, now = Date.now) {
  return token.expiresAt < now();
}
// test: isExpired(token, () => 1_000)
```

Over-mocking is a smell: if a test mocks everything, it tests the mocks. Mock at boundaries (network, time, randomness), not your own internal functions.

## Async code and time

```ts
it("retries once", async () => {
  const fetcher = vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValue("ok");
  await expect(loadWithRetry(fetcher)).resolves.toBe("ok");
  expect(fetcher).toHaveBeenCalledTimes(2);
});
```

Always `await` (or return) the promise, or the test passes before the assertion runs. Use fake timers (`vi.useFakeTimers()`, `jest.useFakeTimers()`) for debounce, retries and timeouts, so tests stay fast and deterministic.

## Testing UI

Test what the user sees and does, not implementation details:

```tsx
render(<Login />);
await user.type(screen.getByLabelText("Email"), "a@b.co");
await user.click(screen.getByRole("button", { name: "Sign in" }));
expect(await screen.findByText("Welcome back")).toBeInTheDocument();
```

Query by **role and accessible name** first, then label, then text. `data-testid` is a last resort. This also nudges you towards accessible markup. Don't assert on internal state or CSS class names.

## Coverage

Coverage shows what was **executed**, not what was **verified**. Aim for meaningful coverage of business logic rather than 100% of everything.

## Interview checklist

- Write a clear arrange-act-assert test with edge cases.
- Explain stubs vs mocks vs fakes, and inject dependencies to make code testable.
- Test async code and timers without flakiness.
- Query components by role and label, like a user would.
