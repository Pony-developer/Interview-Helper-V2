## Math і компанія

```csharp
Math.Round(2.5);                               // 2: за замовчуванням банківське округлення (до парного)!
Math.Round(2.5, MidpointRounding.AwayFromZero); // 3
Math.Round(1.2345m, 2);                        // 1.23
Math.Floor(-2.5); Math.Ceiling(-2.5); Math.Truncate(-2.5);   // -3, -2, -2
Math.Clamp(value, 0, 100);                     // .NET Core 2.0+
Math.Abs(int.MinValue);                        // OverflowException: додатного відповідника немає
Math.DivRem(17, 5, out int rem);               // 3, rem = 2
```

`Math` працює з `double` (плюс перевантаження для `decimal` для округлення й базових операцій). `MathF` має версії для `float`, що уникають перетворень у графічному коді.

Банківське округлення (половину — до парного) за замовчуванням, бо воно не зсуває суми вгору, а це важливо у фінансах і статистиці. Якщо бізнес-правила кажуть «половину — вгору», передайте `MidpointRounding.AwayFromZero` явно.

## За межами примітивних типів

| Тип | Для чого |
| --- | --- |
| `BigInteger` | цілі будь-якого розміру: криптографія, факторіали, точна комбінаторика |
| `Complex` | комплексні числа з `+`, `*`, `Magnitude`, `Phase` |
| `Half` (.NET 5) | 16-бітне дробове число для зберігання в ML і графіці |
| `Int128`/`UInt128` (.NET 7) | 128-бітні цілі |

```csharp
BigInteger f = 1;
for (int i = 2; i <= 50; i++) f *= i;          // 50! має 65 цифр: жодного переповнення
```

`BigInteger` незмінний і алокує для кожного результату, тож він набагато повільніший за `long`.

## Випадкові числа

```csharp
var rnd = new Random();                 // зерно від системи
int dice = rnd.Next(1, 7);              // 1..6: верхня межа не включається
double p = rnd.NextDouble();            // [0, 1)
int shared = Random.Shared.Next(100);   // .NET 6: потокобезпечний спільний екземпляр

var repeatable = new Random(42);        // те саме зерно → та сама послідовність (тести, симуляції)
```

- Екземпляри `Random` **не потокобезпечні**; з кількох потоків використовуйте `Random.Shared`.
- У старому .NET Framework кілька `Random`, створених у щільному циклі, давали однакові послідовності (зерно від часу). .NET Core це виправив.
- `Random` **передбачуваний**. Для токенів, ключів, солі й паролів використовуйте `RandomNumberGenerator`:

```csharp
byte[] token = RandomNumberGenerator.GetBytes(32);
int secureIndex = RandomNumberGenerator.GetInt32(0, alphabet.Length);
```

## Робота з бітами

```csharp
int flags = 0;
flags |= 1 << 3;                 // встановити біт 3
bool on = (flags & (1 << 3)) != 0;
flags &= ~(1 << 3);              // скинути біт 3
flags ^= 1 << 0;                 // перемкнути біт 0
int x = -16 >> 2;                // -4: арифметичний зсув зберігає знак для знакових типів
uint y = 0x80000000 >> 31;       // 1: логічний зсув для беззнакових типів
```

`System.Numerics.BitOperations` (.NET Core 3.0+) відкриває апаратні інструкції:

```csharp
BitOperations.PopCount(0b1011u);        // 3 встановлені біти
BitOperations.Log2(1000u);              // 9
BitOperations.IsPow2(64);               // .NET 6
BitOperations.RoundUpToPowerOf2(1000u); // 1024 (.NET 6)
BitOperations.LeadingZeroCount(1u);     // 31
BitOperations.RotateLeft(value, 5);
```

Де можливо, вони компілюються в одну інструкцію процесора (`popcnt`, `lzcnt`).

## Числові перетворення з втратою даних

- `Convert.ToInt32(2.5)` → 2 (банківське округлення), `(int)2.5` → 2 (відкидання), `(int)2.7` → 2, `Convert.ToInt32(2.7)` → 3.
- Перетворення великого `double` в `int` у контексті `unchecked` дає невизначене значення; у `checked` — кидає виняток.

## Що сказати на співбесіді

- `Math.Round` за замовчуванням округлює банківським способом.
- `Random` — для симуляцій; `RandomNumberGenerator` — для безпеки.
- `BitOperations` дає апаратно прискорений підрахунок бітів і логарифми.
