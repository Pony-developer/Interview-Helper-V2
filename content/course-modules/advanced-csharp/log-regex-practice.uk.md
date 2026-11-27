## Завдання

Розберіть рядки логу застосунку на кшталт

```
2024-03-05 14:30:05 [WARN] (Billing) Payment retried took 350ms
```

1. Замініть шаблон `"TODO"` **одним** регулярним виразом (дослівним рядком) з **іменованими групами**:
   - `time`: `yyyy-MM-dd HH:mm:ss`;
   - `level`: рівно `INFO`, `WARN` або `ERROR` (рядки з іншими рівнями не мають збігатися);
   - `source`: текст у дужках (може містити пробіли, як `Sql Server`);
   - `message`: решта рядка, **крім** завершального ` took <n>ms`, число з якого потрапляє в необов'язкову групу `ms`.

   Поставте якорі `^...$`. Підказка: зробіть повідомлення лінивим (`.*?`), щоб необов'язкова частина `(?: took (?<ms>\d+)ms)?` мала шанс збігтися в кінці. Передайте `RegexOptions.Compiled | RegexOptions.CultureInvariant`.
2. **`Parse(line)`**: поверніть null, коли рядок не збігається; інакше побудуйте `LogEntry`, розібравши час через `DateTime.ParseExact(..., CultureInfo.InvariantCulture)` і встановивши `DurationMs` лише тоді, коли група `ms` спрацювала (`Groups["ms"].Success`).

Очікуваний результат:

```
14:30:05 | WARN | Billing | Payment retried | 350 ms
14:30:06 | INFO | Web | GET /orders/42
14:31:00 | ERROR | Sql Server | Deadlock detected | 1200 ms
skipped: garbage line
skipped: 2024-03-05 14:31:01 [DEBUG] (Web) not a known level
```
