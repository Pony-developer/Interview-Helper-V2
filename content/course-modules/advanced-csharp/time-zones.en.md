## Offsets are not time zones

- An **offset** is a fixed difference from UTC: `+02:00`.
- A **time zone** is a set of rules about which offset applies when: `Europe/Kyiv` is `+02:00` in winter and `+03:00` in summer, and those rules have changed over the years.

`TimeZoneInfo` represents a time zone with its full rule history.

```csharp
TimeZoneInfo kyiv = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");   // IANA id
TimeZoneInfo local = TimeZoneInfo.Local;
TimeZoneInfo utc = TimeZoneInfo.Utc;

DateTime nowInKyiv = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, kyiv);
TimeSpan offset = kyiv.GetUtcOffset(DateTime.UtcNow);
bool summer = kyiv.IsDaylightSavingTime(nowInKyiv);
```

## Time zone ids

Windows historically used its own ids (`"FLE Standard Time"`), Linux and macOS use **IANA** ids (`"Europe/Kyiv"`). Since .NET 6, `FindSystemTimeZoneById` accepts both kinds on every OS (using ICU), and `TimeZoneInfo.TryConvertIanaIdToWindowsId` converts between them. Store IANA ids: they're the portable standard.

## The two DST traps

When clocks go **forward** (spring), one hour of local time doesn't exist. When they go **back** (autumn), one hour happens twice.

```csharp
var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");
var springGap = new DateTime(2024, 3, 31, 3, 30, 0);
Console.WriteLine(tz.IsInvalidTime(springGap));       // True: 03:30 never happened that night

var autumnFold = new DateTime(2024, 10, 27, 3, 30, 0);
Console.WriteLine(tz.IsAmbiguousTime(autumnFold));    // True: 03:30 happened twice
TimeSpan[] options = tz.GetAmbiguousTimeOffsets(autumnFold);   // +03:00 and +02:00
```

Converting an invalid local time throws `ArgumentException`; for an ambiguous one, .NET picks the standard-time offset. Scheduling code ("run at 03:30 every day") must decide what to do in both cases.

## Arithmetic across DST

```csharp
var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");
var before = new DateTimeOffset(2024, 3, 30, 12, 0, 0, TimeSpan.FromHours(2));

// "24 hours later" (an instant)
var plus24h = before.AddHours(24);                           // 2024-03-31 12:00 +02:00 → 13:00 local!

// "same wall-clock time tomorrow" (a calendar operation)
var localTomorrow = before.DateTime.AddDays(1);              // 2024-03-31 12:00 local
var sameTimeTomorrow = new DateTimeOffset(localTomorrow, tz.GetUtcOffset(localTomorrow));   // 12:00 +03:00
```

Decide which one the business means: "a 24-hour token" is an instant duration; "the meeting repeats daily at noon" is a wall-clock rule.

## Storage guidelines

| Data | Store as |
| --- | --- |
| When something happened (created, paid) | UTC `DateTime` or `DateTimeOffset` |
| A future local event (a meeting at 10:00 in Kyiv) | local date-time **plus** the IANA zone id; compute UTC when needed, because rules may change |
| A date with no time (birthday) | `DateOnly` |
| A recurring time (store opens at 09:00) | `TimeOnly` + zone id |

## Interview takeaways

- An offset is a number; a time zone is a rule set that changes over time.
- DST creates nonexistent and ambiguous local times; scheduling code must handle both.
- Store instants in UTC; store future local events as local time + zone id.
