## Типи дат і часу

| Тип | Подає | Типове використання |
| --- | --- | --- |
| `DateTime` | дату й час плюс `Kind` (Utc, Local, Unspecified) | старі API, локальне відображення |
| `DateTimeOffset` | дату й час **плюс зсув від UTC** | мітки часу, логи, API, бази даних |
| `DateOnly` (.NET 6) | календарну дату | дні народження, терміни, свята |
| `TimeOnly` (.NET 6) | час доби | години роботи, час будильника |
| `TimeSpan` | тривалість (тики) | минулий час, тайм-аути, інтервали |

Усі вони — незмінні структури з точністю до **тика** у 100 наносекунд.

## DateTime і його Kind

```csharp
var utc = DateTime.UtcNow;                         // Kind = Utc
var local = DateTime.Now;                          // Kind = Local (часовий пояс машини)
var unspecified = new DateTime(2024, 3, 5, 9, 0, 0);   // Kind = Unspecified

Console.WriteLine(utc.ToLocalTime());
Console.WriteLine(local.ToUniversalTime());
```

Пастки:

- `==` порівнює лише тики й **ігнорує Kind**: 9:00 UTC дорівнює 9:00 Local, хоча це різні моменти.
- Значення `Unspecified` метод `ToUniversalTime()` трактує як локальні, а інші — як UTC. Значення з бази даних зазвичай повертаються як `Unspecified`.
- `DateTime.Now` повільнуватий (перетворює з UTC за правилами часового поясу) і залежить від налаштувань сервера.

Правило: **зберігайте й рахуйте в UTC**, у локальний час перетворюйте лише для відображення.

## DateTimeOffset

```csharp
var placed = DateTimeOffset.Now;                   // напр. 2024-03-05 14:30 +02:00
Console.WriteLine(placed.UtcDateTime);              // 12:30 UTC
Console.WriteLine(placed.Offset);                   // 02:00:00

var a = new DateTimeOffset(2024, 3, 5, 14, 30, 0, TimeSpan.FromHours(2));
var b = new DateTimeOffset(2024, 3, 5, 12, 30, 0, TimeSpan.Zero);
Console.WriteLine(a == b);                          // True: той самий момент
Console.WriteLine(a.EqualsExact(b));                // False: різні зсуви
```

Він однозначно фіксує **момент**. Чого він не знає, так це *часового поясу* (зсув +02:00 може бути Києвом узимку чи Каїром), тож щоб додати «один день за місцевим часом» через перехід на літній час, усе одно потрібен `TimeZoneInfo`.

## DateOnly і TimeOnly

```csharp
var due = new DateOnly(2024, 4, 1);
var nextMonth = due.AddMonths(1);
DateOnly today = DateOnly.FromDateTime(DateTime.Today);
int daysLeft = due.DayNumber - today.DayNumber;

var opens = new TimeOnly(9, 0);
bool open = TimeOnly.FromDateTime(DateTime.Now).IsBetween(opens, new TimeOnly(18, 0));   // враховує перехід через північ
```

`DateTime` для чистої дати — запрошення до помилок: день народження, збережений як локальна північ, може зсунутися на день при перетворенні в UTC.

## Арифметика

```csharp
var start = new DateTime(2024, 1, 31);
start.AddMonths(1);          // 2024-02-29: обрізано до останнього дня місяця
start.AddDays(-1);
TimeSpan gap = DateTime.UtcNow - start;
gap.TotalHours;              // double: уся тривалість у годинах
gap.Hours;                   // int: лише компонента годин (0–23)
```

`TimeSpan.Hours` проти `TotalHours` — класичне джерело помилок.

## Час, який можна тестувати

`DateTime.UtcNow` — прихована залежність, що ускладнює тестування. Натомість впроваджуйте годинник: власний інтерфейс `IClock` або `TimeProvider` (вбудований у .NET 8).

## Що сказати на співбесіді

- Для моментів часу — UTC (або `DateTimeOffset`); локальний час лише на краю UI.
- `DateTime ==` ігнорує Kind; `DateTimeOffset ==` порівнює моменти.
- `DateOnly`/`TimeOnly` — для дат і часу доби; `TimeSpan` — для тривалостей.
