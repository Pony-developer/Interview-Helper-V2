## Task

Parse application log lines like

```
2024-03-05 14:30:05 [WARN] (Billing) Payment retried took 350ms
```

1. Replace the `"TODO"` pattern with **one** regex (as a verbatim string) using **named groups**:
   - `time`: `yyyy-MM-dd HH:mm:ss`;
   - `level`: exactly `INFO`, `WARN` or `ERROR` (lines with other levels must not match);
   - `source`: the text inside the parentheses (it may contain spaces, like `Sql Server`);
   - `message`: the rest of the line, **except** a trailing ` took <n>ms`, whose number goes into an optional group `ms`.

   Anchor it with `^...$`. Hint: make the message lazy (`.*?`) so the optional `(?: took (?<ms>\d+)ms)?` part gets a chance to match at the end. Pass `RegexOptions.Compiled | RegexOptions.CultureInvariant`.
2. **`Parse(line)`**: return null when the line doesn't match; otherwise build a `LogEntry`, parsing the time with `DateTime.ParseExact(..., CultureInfo.InvariantCulture)` and setting `DurationMs` only when the `ms` group succeeded (`Groups["ms"].Success`).

Expected output:

```
14:30:05 | WARN | Billing | Payment retried | 350 ms
14:30:06 | INFO | Web | GET /orders/42
14:31:00 | ERROR | Sql Server | Deadlock detected | 1200 ms
skipped: garbage line
skipped: 2024-03-05 14:31:01 [DEBUG] (Web) not a known level
```
