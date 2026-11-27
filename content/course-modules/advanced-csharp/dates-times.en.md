## The date and time types

| Type | Represents | Typical use |
| --- | --- | --- |
| `DateTime` | a date and time, plus a `Kind` (Utc, Local, Unspecified) | legacy APIs, local display |
| `DateTimeOffset` | a date and time **plus an offset from UTC** | timestamps, logs, APIs, databases |
| `DateOnly` (.NET 6) | a calendar date | birthdays, due dates, holidays |
| `TimeOnly` (.NET 6) | a time of day | opening hours, alarm times |
| `TimeSpan` | a duration (ticks) | elapsed time, timeouts, intervals |

All are immutable structs with 100-nanosecond **tick** precision.

## DateTime and its Kind

```csharp
var utc = DateTime.UtcNow;                         // Kind = Utc
var local = DateTime.Now;                          // Kind = Local (machine's time zone)
var unspecified = new DateTime(2024, 3, 5, 9, 0, 0);   // Kind = Unspecified

Console.WriteLine(utc.ToLocalTime());
Console.WriteLine(local.ToUniversalTime());
```

Pitfalls:

- `==` compares only ticks and **ignores Kind**: 9:00 UTC equals 9:00 Local, though they're different instants.
- `Unspecified` values get treated as local by `ToUniversalTime()` and as UTC by others. Values from a database usually come back `Unspecified`.
- `DateTime.Now` is slow-ish (it converts from UTC using time zone rules) and depends on the server's settings.

Rule: **store and compute in UTC**, convert to local only for display.

## DateTimeOffset

```csharp
var placed = DateTimeOffset.Now;                   // e.g. 2024-03-05 14:30 +02:00
Console.WriteLine(placed.UtcDateTime);              // 12:30 UTC
Console.WriteLine(placed.Offset);                   // 02:00:00

var a = new DateTimeOffset(2024, 3, 5, 14, 30, 0, TimeSpan.FromHours(2));
var b = new DateTimeOffset(2024, 3, 5, 12, 30, 0, TimeSpan.Zero);
Console.WriteLine(a == b);                          // True: same instant
Console.WriteLine(a.EqualsExact(b));                // False: different offsets
```

It pins down the **instant** unambiguously. What it doesn't know is the *time zone* (an offset of +02:00 could be Kyiv in winter or Cairo), so to add "one day in local time" across a DST change you still need `TimeZoneInfo`.

## DateOnly and TimeOnly

```csharp
var due = new DateOnly(2024, 4, 1);
var nextMonth = due.AddMonths(1);
DateOnly today = DateOnly.FromDateTime(DateTime.Today);
int daysLeft = due.DayNumber - today.DayNumber;

var opens = new TimeOnly(9, 0);
bool open = TimeOnly.FromDateTime(DateTime.Now).IsBetween(opens, new TimeOnly(18, 0));   // handles midnight wrap
```

Using `DateTime` for a pure date invites bugs: a birthday stored as midnight local time can shift a day when converted to UTC.

## Arithmetic

```csharp
var start = new DateTime(2024, 1, 31);
start.AddMonths(1);          // 2024-02-29: clamped to the last day of the month
start.AddDays(-1);
TimeSpan gap = DateTime.UtcNow - start;
gap.TotalHours;              // double: the whole duration in hours
gap.Hours;                   // int: just the hours component (0–23)
```

`TimeSpan.Hours` vs `TotalHours` is a classic bug source.

## Testable time

`DateTime.UtcNow` is a hidden dependency that makes code hard to test. Inject a clock instead: your own `IClock` interface, or `TimeProvider` (built into .NET 8).

## Interview takeaways

- Use UTC (or `DateTimeOffset`) for instants; local time only at the UI edge.
- `DateTime ==` ignores Kind; `DateTimeOffset ==` compares instants.
- `DateOnly`/`TimeOnly` for dates and times of day; `TimeSpan` for durations.
