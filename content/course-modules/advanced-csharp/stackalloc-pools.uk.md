## stackalloc: буфери, звільнення яких нічого не коштує

```csharp
Span<char> buffer = stackalloc char[64];
if (value.TryFormat(buffer, out int written, "N2", CultureInfo.InvariantCulture))
    Log(buffer[..written]);
```

- Пам'ять береться з **кадру стеку** поточного методу й зникає, коли метод повертається: GC не задіяний зовсім.
- Присвоєння в `Span<T>` означає, що `unsafe`-код не потрібен.
- Стек малий (близько 1 МБ на потік), і його переповнення **вбиває процес** (`StackOverflowException` не можна перехопити). Тримайте розміри `stackalloc` невеликими й **обмеженими**: поширений патерн перемикається на масив із пулу понад певний поріг.

```csharp
const int MaxStack = 256;
char[]? rented = null;
Span<char> buf = length <= MaxStack
    ? stackalloc char[MaxStack]
    : (rented = ArrayPool<char>.Shared.Rent(length));
try
{
    // ... використовуємо buf[..length]
}
finally
{
    if (rented != null) ArrayPool<char>.Shared.Return(rented);
}
```

Не робіть `stackalloc` у циклі: пам'ять звільняється лише тоді, коли метод повертається.

## ArrayPool<T>

Позичання й повернення масивів уникає алокації (і подальшого збирання) тимчасових буферів, особливо великих, що потрапили б у Large Object Heap:

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(81920);    // може повернути БІЛЬШИЙ масив
try
{
    int read;
    while ((read = await source.ReadAsync(buffer.AsMemory(0, 81920), ct)) > 0)
        await destination.WriteAsync(buffer.AsMemory(0, read), ct);
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: false);
}
```

Правила:

- Масив може бути **довшим**, ніж просили: завжди відстежуйте довжину, якою користуєтеся.
- Він може містити **старі дані** від попереднього позичальника; передавайте `clearArray: true`, повертаючи буфери з чутливими даними.
- **Повертайте рівно один раз** і ніколи не чіпайте масив після повернення (ним може користуватися інший позичальник).
- `ArrayPool<T>.Shared` потокобезпечний і тримає кеші для кожного потоку; `ArrayPool<T>.Create(...)` створює приватний пул.

## Нативна пам'ять

Коли потрібна пам'ять повністю поза купою GC (величезні буфери, interop):

```csharp
unsafe
{
    void* p = NativeMemory.Alloc((nuint)size);          // .NET 6; раніше Marshal.AllocHGlobal
    try
    {
        var span = new Span<byte>(p, size);              // безпечний доступ через span
        span.Clear();
    }
    finally
    {
        NativeMemory.Free(p);                            // ручне керування часом життя: звільнити рівно раз
    }
}
```

Обгортайте нативні алокації в `SafeHandle` чи `MemoryManager<T>`, щоб вони надійно звільнялися. `GC.AddMemoryPressure` повідомляє GC про великі нативні алокації, якими володіють керовані об'єкти.

## MemoryMarshal і Unsafe

`System.Runtime.InteropServices.MemoryMarshal` (`Cast`, `AsBytes`, `GetReference`, `CreateSpan`) і `System.Runtime.CompilerServices.Unsafe` дозволяють просунутому коду переінтерпретовувати пам'ять і пропускати перевірки. Так BCL реалізує швидкі шляхи, і вони обходять типобезпечність: використовуйте лише тоді, коли бенчмарк показує, що це важливо.

## Що сказати на співбесіді

- `stackalloc` у `Span<T>`: безкоштовні буфери без GC, але лише невеликі й обмежені.
- `ArrayPool<T>.Shared.Rent/Return`: повторне використання тимчасових масивів; стежте за довжиною, старими даними й одноразовим поверненням.
- Нативна пам'ять потребує ручного звільнення; обгортайте її в безпечні типи.
