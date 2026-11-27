## Task

Implement a tiny duration language on top of `TimeSpan`.

1. **`Durations.Parse(text)`** reads strings like `"1d 2h 30m 15s"`: numbers followed by a unit `d`, `h`, `m` or `s`, in any order and any subset, with optional spaces (`"2h0m"` is valid). Add up the parts with `TimeSpan.FromDays/FromHours/...`. An unknown unit throws `FormatException` with the message `Unknown unit 'w'`; a missing number or unit throws `FormatException` too.
2. **`Durations.Format(t)`** writes the same format back, skipping zero parts: `01:30:00` becomes `1h 30m`. `TimeSpan.Zero` becomes `0s`. Use the component properties `Days`, `Hours`, `Minutes`, `Seconds` (not `TotalHours`!).

The last two lines of `Main` show date arithmetic: adding a month to 30 January in a leap year clamps to 29 February, and subtracting dates gives a `TimeSpan`.

Expected output:

```
1d 2h 30m 15s => 1.02:30:15 => 1d 2h 30m 15s
90m => 01:30:00 => 1h 30m
45s 1h => 01:00:45 => 1h 45s
2h0m => 02:00:00 => 2h
0s
error: Unknown unit 'w'
2024-02-29
31
```
