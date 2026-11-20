---
skill: dates-time
title: "Dates, time zones and Temporal: getting time right"
summary: "What a Date actually stores, the parsing rules that surprise everyone, zero-based months and overflow, UTC vs local getters, time zones and daylight saving time, formatting with Intl.DateTimeFormat and RelativeTimeFormat, safe date arithmetic, storing and sending timestamps, and the Temporal API that replaces Date."
readingMinutes: 10
---

Date bugs are some of the most common production bugs: off-by-one days for users in other time zones, a meeting that moves when daylight saving time starts, a "yesterday" that's wrong at 00:30. Most of them come from mixing up **instants** (a moment on the global timeline) with **wall-clock times** (what a clock on someone's wall shows).

## What a Date is

A `Date` holds a single number: **milliseconds since 1970-01-01T00:00:00Z** (the Unix epoch, in UTC). It has no time zone of its own. Getters interpret that instant either in **UTC** (`getUTCHours`) or in the **runtime's local time zone** (`getHours`), so the same `Date` shows different hours on a server in Frankfurt and a laptop in Tokyo.

- `Date.now()` and `date.getTime()` return the number; comparing two dates is comparing numbers (`a.getTime() === b.getTime()`, since `a === b` compares objects).
- An invalid date is still a `Date`: `new Date("nope")` gives `Invalid Date`, whose `getTime()` is `NaN`. Check with `Number.isNaN(d.getTime())`.
- `Date` objects are **mutable** (`setDate`, `setHours`), so share them carefully.

## Constructing and parsing

- `new Date(2024, 0, 31)`: year, **zero-based month** (0 = January), day, interpreted in **local** time.
- `Date.UTC(2024, 0, 31)` returns the timestamp for that date in UTC.
- **Overflow rolls over**: `new Date(2024, 0, 32)` is February 1, and `new Date(2024, 1, 0)` is the last day of January, which is a handy way to get month lengths.
- String parsing has one reliable format, ISO 8601, with a trap: **date-only** strings (`"2024-03-10"`) are parsed as **UTC midnight**, while **date-time strings without an offset** (`"2024-03-10T09:00"`) are parsed as **local** time. Any other format (`"03/10/2024"`, `"10 March 2024"`) is implementation-defined. Parse user input explicitly, and always send ISO strings with an offset or `Z`.

## Time zones and daylight saving time

A time zone is more than an offset: `Europe/Kyiv` is UTC+2 in winter and UTC+3 in summer, and the rules change by law. Consequences:

- Some local times **don't exist** (clocks jump from 03:00 to 04:00) and some happen **twice** (04:00 to 03:00 in autumn).
- A local day is not always 24 hours. Adding `24 * 60 * 60 * 1000` ms to "midnight" can land on 23:00 or 01:00. Add **calendar days** with `setDate(getDate() + 1)` instead, and add **durations** in milliseconds.
- Store instants as **UTC** (ISO strings with `Z`, or epoch milliseconds) and store the user's **IANA time zone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`) separately when wall-clock meaning matters ("every Monday at 9:00 in Kyiv").
- Pure dates without time (birthdays, holidays) aren't instants. Store them as `"YYYY-MM-DD"` strings, not as midnight in some time zone, or they'll shift a day for users west of UTC.

## Formatting with Intl

`Intl.DateTimeFormat` formats an instant for any locale and time zone:

```js
const date = new Date("2024-03-10T09:00:00Z");
new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
}).format(date); // "10 березня 2024 р. о 11:00"
```

`toLocaleString` uses the same machinery. `formatToParts` gives the pieces for custom layouts, `Intl.RelativeTimeFormat` produces "3 days ago" or "in 2 hours", and `toISOString()` always produces UTC with `Z`. Avoid hand-building strings from getters: you'd need padding, translations and time-zone handling yourself.

## Libraries and Temporal

Moment.js is in maintenance mode (large and mutable); date-fns (functions over native `Date`), Day.js (small Moment-like API) and Luxon (time-zone aware) are common choices. The **Temporal** API, shipping in modern engines, fixes `Date` at the language level:

- **Immutable** types with clear meanings: `Temporal.Instant` (exact time), `Temporal.ZonedDateTime` (instant + time zone + calendar), `Temporal.PlainDate`, `PlainTime` and `PlainDateTime` (wall-clock values without a zone), and `Temporal.Duration`.
- One-based months, strict ISO parsing that rejects ambiguous input, and DST-aware arithmetic (`zoned.add({ days: 1 })` keeps the wall-clock time).
- `Temporal.Now.zonedDateTimeISO("Europe/Kyiv")` and explicit `disambiguation` options for non-existent or repeated times.

## Interview checklist

- Explain what a `Date` stores, and the difference between an instant and a wall-clock time.
- Explain the zero-based months, overflow, and date-only vs date-time parsing rules.
- Explain why adding 24 hours isn't adding a day, and how DST causes missing and repeated times.
- Format dates for a locale and time zone with `Intl`, and choose how to store timestamps vs calendar dates.
- Describe what Temporal improves.
