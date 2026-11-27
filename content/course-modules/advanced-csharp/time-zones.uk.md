## Зсув — це не часовий пояс

- **Зсув** — фіксована різниця з UTC: `+02:00`.
- **Часовий пояс** — набір правил, який зсув діє коли: `Europe/Kyiv` має `+02:00` узимку і `+03:00` улітку, а самі правила з роками змінювалися.

`TimeZoneInfo` подає часовий пояс з усією історією правил.

```csharp
TimeZoneInfo kyiv = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");   // ідентифікатор IANA
TimeZoneInfo local = TimeZoneInfo.Local;
TimeZoneInfo utc = TimeZoneInfo.Utc;

DateTime nowInKyiv = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, kyiv);
TimeSpan offset = kyiv.GetUtcOffset(DateTime.UtcNow);
bool summer = kyiv.IsDaylightSavingTime(nowInKyiv);
```

## Ідентифікатори часових поясів

Windows історично використовувала власні ідентифікатори (`"FLE Standard Time"`), Linux і macOS — ідентифікатори **IANA** (`"Europe/Kyiv"`). З .NET 6 `FindSystemTimeZoneById` приймає обидва види на будь-якій ОС (через ICU), а `TimeZoneInfo.TryConvertIanaIdToWindowsId` перетворює одні на інші. Зберігайте ідентифікатори IANA: це переносний стандарт.

## Дві пастки літнього часу

Коли годинники переводять **уперед** (навесні), однієї години місцевого часу не існує. Коли **назад** (восени), одна година трапляється двічі.

```csharp
var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");
var springGap = new DateTime(2024, 3, 31, 3, 30, 0);
Console.WriteLine(tz.IsInvalidTime(springGap));       // True: 03:30 тієї ночі не було

var autumnFold = new DateTime(2024, 10, 27, 3, 30, 0);
Console.WriteLine(tz.IsAmbiguousTime(autumnFold));    // True: 03:30 було двічі
TimeSpan[] options = tz.GetAmbiguousTimeOffsets(autumnFold);   // +03:00 і +02:00
```

Перетворення неіснуючого місцевого часу кидає `ArgumentException`; для неоднозначного .NET обирає зсув стандартного часу. Код планування («запускати о 03:30 щодня») мусить вирішити, що робити в обох випадках.

## Арифметика через перехід на літній час

```csharp
var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");
var before = new DateTimeOffset(2024, 3, 30, 12, 0, 0, TimeSpan.FromHours(2));

// «через 24 години» (момент часу)
var plus24h = before.AddHours(24);                           // 2024-03-31 12:00 +02:00 → 13:00 за місцевим!

// «той самий час на годиннику завтра» (календарна операція)
var localTomorrow = before.DateTime.AddDays(1);              // 2024-03-31 12:00 за місцевим
var sameTimeTomorrow = new DateTimeOffset(localTomorrow, tz.GetUtcOffset(localTomorrow));   // 12:00 +03:00
```

Вирішіть, що саме має на увазі бізнес: «токен на 24 години» — це тривалість між моментами; «зустріч щодня опівдні» — правило за годинником.

## Як зберігати

| Дані | Зберігати як |
| --- | --- |
| Коли щось сталося (створено, оплачено) | UTC `DateTime` або `DateTimeOffset` |
| Майбутня місцева подія (зустріч о 10:00 у Києві) | місцеві дата й час **плюс** ідентифікатор поясу IANA; UTC обчислюйте за потреби, бо правила можуть змінитися |
| Дата без часу (день народження) | `DateOnly` |
| Повторюваний час (магазин відкривається о 09:00) | `TimeOnly` + ідентифікатор поясу |

## Що сказати на співбесіді

- Зсув — це число; часовий пояс — набір правил, що змінюється з часом.
- Літній час створює неіснуючий і неоднозначний місцевий час; код планування має обробляти обидва випадки.
- Моменти зберігайте в UTC; майбутні місцеві події — як місцевий час + ідентифікатор поясу.
