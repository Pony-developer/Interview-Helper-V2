## «Немає значення» для типів значень

Тип значення завжди містить значення: `int` не може бути null. Але дані часто мають стан «не задано»: необов'язкова оцінка, nullable-колонка в базі, дата, що ще не настала. C# розв'язує це через `T?` — скорочення для структури `System.Nullable<T>`.

```csharp
int? rating = null;
DateTime? shippedOn = order.IsShipped ? order.ShipDate : null;

Console.WriteLine(rating.HasValue);           // False
Console.WriteLine(rating.GetValueOrDefault()); // 0
// Console.WriteLine(rating.Value);           // InvalidOperationException, коли null
```

`Nullable<T>` — структура з двома полями: значенням і `bool hasValue`. Вона не алокує і може обгортати лише типи значень (`string?` означає інше; див. наступну лекцію).

## Перетворення

```csharp
int? a = 5;          // неявне: T → T?
int b = (int)a;      // явне: T? → T, кидає виняток, якщо null
int c = a ?? 0;      // ідіоматичний спосіб розгорнути із запасним значенням
```

## Пакування nullable

Пакування `int?` зі значенням пакує **внутрішній** `int`; пакування null-`int?` дає **null-посилання**. Тож `object o = (int?)null;` — це просто `null`, а `o is int` працює на запакованому nullable.

## Підняті оператори

Оператори, визначені для `T`, «піднімаються» до `T?`:

```csharp
int? x = 5, y = null;
Console.WriteLine(x + y);    // null: арифметика з null дає null
Console.WriteLine(x > y);    // False: порівняння з null хибні
Console.WriteLine(x < y);    // теж False!
Console.WriteLine(x == y);   // False
Console.WriteLine(y == null);// True: рівність вважає null == null істиною
```

Правило: `==` і `!=` трактують null як звичайне значення; `<`, `>`, `<=`, `>=` повертають `false`, якщо хоч один бік null; арифметика повертає null.

### bool? і тризначна логіка

`bool?` поводиться як тризначна логіка SQL з `&` і `|`:

| | `true` | `false` | `null` |
| --- | --- | --- | --- |
| `null & ...` | null | **false** | null |
| `null \| ...` | **true** | null | null |

(`&&` і `||` для `bool?` не дозволені.)

## Патерни з nullable

```csharp
if (rating is int r) Console.WriteLine($"Rated {r}");   // перевірити й розгорнути одним кроком
if (rating is null) Console.WriteLine("Not rated");
string label = rating switch { null => "n/a", > 3 => "good", _ => "meh" };
```

## Альтернатива: магічні значення

До `Nullable<T>` код використовував «магічні значення» на кшталт `-1` чи `DateTime.MinValue` для «нічого». Вони непомітно просочуються в обчислення. `T?` робить випадок «немає значення» явним і перевіреним компілятором.

## Що сказати на співбесіді

- `T?` на типі значення — це `Nullable<T>`: структура з `HasValue` і `Value`.
- Розгортайте через `??`, `GetValueOrDefault()` чи патерн типу; `.Value` кидає виняток, коли null.
- Підняті порівняння з null хибні; піднята арифметика дає null.
