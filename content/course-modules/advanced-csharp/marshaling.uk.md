## Blittable і non-blittable типи

**Blittable**-тип має однакове подання в пам'яті в керованому й нативному коді, тож його можна передати без перетворення (часто закріпивши й передавши вказівник):

- `byte`, `sbyte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, `IntPtr`/`nint`;
- одновимірні масиви з них;
- структури лише з blittable-полями з послідовною чи явною розкладкою.

**Non-blittable** типи потребують перетворення: `bool` (1 байт у C#, але `BOOL` у Win32 — 4 байти), `char` (UTF-16 чи ANSI?), `string`, класи, масиви non-blittable типів. Перетворення коштують часу, а іноді й копій.

## Рядки

```csharp
[DllImport("kernel32.dll", CharSet = CharSet.Unicode)]   // передавати як UTF-16 (функції «W» у Windows)
static extern uint GetEnvironmentVariable(string name, StringBuilder buffer, uint size);

[DllImport("mylib", CharSet = CharSet.Ansi)]             // передавати як 8-бітний текст кодової сторінки
static extern void log_message([MarshalAs(UnmanagedType.LPUTF8Str)] string message);   // або примусово UTF-8
```

- Параметри `string` — **лише вхідні** (незмінні); для вихідних буферів передавайте `StringBuilder` з місткістю або `char[]`/`Span<char>`.
- Windows має варіанти `xxxA` (ANSI) і `xxxW` (широкі/UTF-16); `CharSet.Unicode` обирає `W`. Бібліотеки Linux зазвичай очікують UTF-8: `LPUTF8Str` (або `StringMarshalling.Utf8` з `LibraryImport`).
- Хто звільняє рядок, повернутий нативним кодом? Якщо його виділила нативна сторона, потрібна її відповідна функція звільнення; маршалер цього не вгадає.

## Структури та розкладка

```csharp
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
struct SystemTime
{
    public ushort Year, Month, DayOfWeek, Day, Hour, Minute, Second, Milliseconds;
}

[DllImport("kernel32.dll")]
static extern void GetSystemTime(out SystemTime time);
```

- `LayoutKind.Sequential` (за замовчуванням для структур): поля в порядку оголошення з **доповненням** для вирівнювання, як у компіляторах C. `byte`, за яким іде `int`, дає 3 байти доповнення між ними.
- `Pack = n` змінює вирівнювання, як `#pragma pack(n)` у C.
- `LayoutKind.Explicit` + `[FieldOffset(x)]` розміщує кожне поле точно за зсувом; перекриті зсуви створюють **об'єднання** (union).
- `Marshal.SizeOf<T>()` і `Marshal.OffsetOf<T>(nameof(Field))` показують некеровану розкладку; під час налагодження порівнюйте з `sizeof` і `offsetof` у C.
- Вбудовані масиви й рядки: `[MarshalAs(UnmanagedType.ByValArray, SizeConst = 16)]`, `ByValTStr`.

## Напрямок параметрів

| C# | Нативний погляд |
| --- | --- |
| `int x` | значення |
| `ref int x` | `int*` вхід/вихід |
| `out int x` | `int*` вихід |
| `[In] T[]` / `[Out] T[]` | керують, у якому напрямку копіюється вміст масиву |
| `ref MyStruct s` | `MyStruct*` |
| параметр-клас | вказівник на змаршалені поля (за замовчуванням вхідний) |

## Об'єднання на практиці

```csharp
[StructLayout(LayoutKind.Explicit)]
struct Variant
{
    [FieldOffset(0)] public int Type;
    [FieldOffset(8)] public long AsLong;     // ці три перекриваються
    [FieldOffset(8)] public double AsDouble;
    [FieldOffset(8)] public IntPtr AsPointer;
}
```

Поле типу посилання не можна перекривати полем типу значення (GC заплутався б); об'єднання — для некерованих даних.

## Що сказати на співбесіді

- Blittable-типи передаються без перетворення; рядки, bool і класи потребують маршалінгу.
- Обирайте кодування рядків явно (`CharSet.Unicode`, `LPUTF8Str`).
- `StructLayout`, `Pack` і `FieldOffset` відтворюють розкладку й об'єднання C; `Marshal.SizeOf/OffsetOf` її перевіряють.
