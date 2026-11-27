## Пом'якшена «помилка на мільярд доларів»

`NullReferenceException` — найпоширеніша помилка виконання в C#. **Nullable-типи посилань** (C# 8) дозволяють компілятору відстежувати, які посилання можуть бути null, і попереджати ще до запуску програми.

Вмикаються для проєкту чи для файлу:

```xml
<Nullable>enable</Nullable>
```

```csharp
#nullable enable
```

У нових проєктах .NET 6 це увімкнено за замовчуванням.

## Дві анотації

```csharp
string name = "Ann";      // non-nullable: ніколи не має бути null
string? nickname = null;  // nullable: може бути null

Console.WriteLine(name.Length);       // нормально
Console.WriteLine(nickname.Length);   // попередження CS8602: можливе розіменування null
if (nickname != null)
    Console.WriteLine(nickname.Length);   // нормально: компілятор знає, що тут не null
```

Компілятор виконує **аналіз потоку**: після перевірки на null, патерну `is not null`, `??=` чи присвоєння non-null значення він знає, що змінна безпечна.

```csharp
string name = null;   // попередження CS8600: перетворення null на non-nullable тип
```

## Це лише час компіляції

`string` і `string?` — **один тип** під час виконання. Коли програма працює, нічого не перевіряється і не гарантується. Non-nullable параметр усе одно може отримати `null` з коду, скомпільованого без цієї можливості, через рефлексію чи десеріалізацію, тож публічні API мають зберігати перевірки аргументів (`ArgumentNullException.ThrowIfNull`).

## Оператор null-forgiving

```csharp
string s = FindName()!;   // «я знаю краще: тут не null»
```

`!` лише вимикає попередження. Використовуйте рідко, там, де компілятор не бачить того, що знаєте ви (наприклад, після перевірки в іншому методі). Зловживання ним зводить усю можливість нанівець.

## Допомога аналізу атрибутами

Коли поведінка методу щодо null залежить від результату, скажіть про це компілятору:

```csharp
public static bool TryFind(int id, [NotNullWhen(true)] out Customer? customer) { ... }

if (TryFind(5, out var c))
    Console.WriteLine(c.Name);   // без попередження: c не null, коли метод повернув true

[return: NotNullIfNotNull("input")]
public static string? Normalize(string? input) => input?.Trim();

public static void ThrowIfNull([NotNull] object? value) { ... }   // після виклику value не null
```

Інші: `[MaybeNull]`, `[AllowNull]`, `[DisallowNull]`, `[MemberNotNull]`, `[DoesNotReturn]`.

## Узагальнення та nullable

```csharp
T? FirstOrNothing<T>(IEnumerable<T> items) where T : class => ...;   // T? — nullable-посилання
T? Find<T>(...)                                                     // C# 9: необмежений T? означає «може повернутися default»
where T : notnull                                                    // T не може бути nullable
```

## Міграція кодової бази

1. Вмикайте можливість файл за файлом (`#nullable enable`) або на весь проєкт як попередження, а не помилки.
2. Спершу анотуйте публічні API: параметри й результати — це контракт.
3. Виправляйте попередження справжніми перевірками, роблячи щось nullable чи ініціалізуючи поля в конструкторах. `!` — крайній засіб.
4. Коли код чистий, розгляньте `<WarningsAsErrors>nullable</WarningsAsErrors>`.

## Що сказати на співбесіді

- `string?` проти `string` — контракт часу компіляції; під час виконання нічого не змінюється.
- Аналіз потоку відстежує перевірки на null; атрибути на кшталт `[NotNullWhen]` пояснюють йому ваші API.
- `!` пригнічує попередження; він не робить значення non-null.
