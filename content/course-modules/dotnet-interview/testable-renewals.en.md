## Task

Questions 124–125: "What is loosely coupled code?" and "Do static classes increase or decrease coupling?" A typical tightly coupled version of this service reads `DateTime.Now` and calls a static `EmailSender.Send(...)` — impossible to test without waiting for real days and sending real emails.

Here the dependencies are abstractions: `IClock` and `INotifier`. The test in `Main` passes a `FakeClock` it can move forward and a `RecordingNotifier` that just remembers messages.

Complete `RenewalService`:

1. Add fields and store the dependencies in the **constructor** (constructor injection).
2. **`SendReminders(subscriptions)`** — for every subscription that has **not expired yet** (`ExpiresAt > now`) and expires **within 3 days** (`ExpiresAt - now <= 3 days`), send `"Your subscription ends on yyyy-MM-dd"` (invariant culture) to its email through the notifier. Return the number of reminders sent. Use only `clock.UtcNow` — no `DateTime.Now`.

Expected output:

```
reminders: 2
reminders: 1
a@shop.ua: Your subscription ends on 2026-11-28
d@shop.ua: Your subscription ends on 2026-11-30
d@shop.ua: Your subscription ends on 2026-11-30
```
