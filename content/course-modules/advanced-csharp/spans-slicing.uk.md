## Один тип для будь-якої неперервної пам'яті

`Span<T>` — представлення **неперервного блоку** елементів `T`, де б він не жив:

```csharp
int[] array = { 1, 2, 3, 4, 5 };
Span<int> all = array;                       // над керованим масивом
Span<int> middle = all.Slice(1, 3);          // { 2, 3, 4 }: без копіювання
Span<int> tail = all[2..];                   // діапазони теж працюють
middle[0] = 20;                              // пише в масив
Console.WriteLine(array[1]);                 // 20

Span<byte> stackBuffer = stackalloc byte[128];   // над стековою пам'яттю
ReadOnlySpan<char> word = "hello world".AsSpan(6);   // над символами рядка, лише для читання
```

Span — це просто **посилання + довжина**. Нарізання створює ще одне посилання + довжину: без алокації, без копіювання. Індексація перевіряє межі й у гарячих циклах така ж швидка, як доступ до масиву.

`ReadOnlySpan<T>` — варіант лише для читання; рядки дають `ReadOnlySpan<char>`, бо вони незмінні.

## Навіщо він існує

До спанів робота з «частиною буфера» означала або копіювання (`Substring`, `Array.Copy`, `ToArray`), або передачу трійок `(array, offset, count)` скрізь. Спани роблять API для частин буфера безпечними й без алокацій, тому BCL їх активно використовує:

```csharp
int n = int.Parse("orders: 42".AsSpan(8));            // розібрати частину рядка без Substring
bool ok = Guid.TryParse(input.AsSpan().Trim(), out var id);
int written = Encoding.UTF8.GetBytes("hi", buffer);   // писати в span, наданий викликачем
stream.Read(buffer.AsSpan(0, 512));
"a,b,c".AsSpan().IndexOf(',');
```

Багато API мають методи `TryFormat(Span<char> destination, out int charsWritten)`, що форматують числа й дати в буфер, не створюючи рядків.

## Правила ref struct

`Span<T>` — це **`ref struct`**: він може вказувати в стек, тож компілятор тримає в стеку і його. Не можна:

- зберігати його в полі класу чи звичайної структури;
- пакувати його, приводити до `object` чи інтерфейсу;
- використовувати його в `async`-методі через `await`, в ітераторі через `yield` чи захоплювати в лямбді;
- використовувати його як аргумент узагальненого типу (до C# 13).

Саме ці обмеження роблять його **безпечним**: span ніколи не переживе пам'ять, на яку вказує.

## Корисні операції

```csharp
span.Fill(0);
span.Clear();
source.CopyTo(destination);          // кидає виняток, якщо destination закороткий; TryCopyTo повертає false
span.Reverse();
span.Sort();                         // MemoryExtensions (.NET 5)
bool same = a.SequenceEqual(b);
int idx = text.AsSpan().IndexOfAny(" ,;");
foreach (ref int x in span) x *= 2;  // ref-обхід: зміна на місці
```

`MemoryMarshal.Cast<byte, int>(bytes)` інтерпретує пам'ять як інший некерований тип без копіювання (стежте за вирівнюванням і порядком байтів).

## Що сказати на співбесіді

- `Span<T>` = безпечне представлення з перевіркою меж над масивами, стеком чи нативною пам'яттю; нарізання не копіює.
- Це `ref struct`: лише стек, без полів, без пакування, без await.
- Використовуйте `ReadOnlySpan<char>`, щоб розбирати частини рядків без `Substring`.
