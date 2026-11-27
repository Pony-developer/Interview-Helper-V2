## Ітератор пише енумератор за вас

Метод, властивість чи локальна функція, що містить `yield return`, — це **ітератор**. Він має повертати `IEnumerable<T>`, `IEnumerator<T>` (або їхні неузагальнені форми) чи `IAsyncEnumerable<T>` для асинхронних ітераторів.

```csharp
static IEnumerable<int> Countdown(int from)
{
    for (int i = from; i > 0; i--)
        yield return i;          // віддати одне значення й зупинитися тут
    yield return 0;              // кілька yield — нормально
}

foreach (int n in Countdown(3)) Console.Write(n + " ");   // 3 2 1 0
```

Компілятор переписує метод у прихований клас: **машину станів**, що реалізує енумератор. Кожен `MoveNext()` виконує тіло до наступного `yield return`, кладе значення в `Current` і запам'ятовує, звідки продовжити.

## Відкладене виконання

Виклик методу-ітератора не виконує **нічого** з його тіла. Він лише створює машину станів. Тіло виконується частинами, коли хтось перелічує.

```csharp
IEnumerable<int> ReadNumbers()
{
    Console.WriteLine("start");
    yield return 1;
    Console.WriteLine("middle");
    yield return 2;
}

var seq = ReadNumbers();        // нічого не друкує
foreach (var x in seq) { }      // start, middle
foreach (var x in seq) { }      // знову start, middle: кожне перелічення починається спочатку
```

Наслідки:

- **Перевірки аргументів теж відкладаються.** Винесіть перевірку в обгортку-не-ітератор, а логіку з `yield` — у локальну функцію, щоб погані аргументи падали одразу.
- **Нескінченні послідовності — нормально**: викликач вирішує, скільки взяти.
- **Повторне перелічення повторює роботу** (і побічні ефекти). Якщо результати потрібні кілька разів, матеріалізуйте їх через `ToList()`.

## yield break

```csharp
static IEnumerable<string> ReadLines(TextReader reader)
{
    while (true)
    {
        string line = reader.ReadLine();
        if (line == null) yield break;    // завершити послідовність
        yield return line;
    }
}
```

## try/finally в ітераторах

`yield return` дозволено в `try`, що має `finally`, але не в `try` з `catch` і не всередині блоків `catch` чи `finally`.

```csharp
static IEnumerable<string> Lines(string path)
{
    var reader = File.OpenText(path);
    try
    {
        string line;
        while ((line = reader.ReadLine()) != null) yield return line;
    }
    finally
    {
        reader.Dispose();   // виконується, коли цикл закінчився АБО коли foreach достроково звільнив енумератор
    }
}
```

Якщо споживач виходить з `foreach` через `break`, `Dispose()` енумератора виконує відкладений `finally`. Якщо хтось викликає `MoveNext()` вручну й ніколи не звільняє енумератор, — ні: завжди перелічуйте через `foreach` (або `using`).

## Композиція ітераторів

Ітератори природно поєднуються в ланцюжок, кожен тягне по одному елементу з попереднього:

```csharp
static IEnumerable<int> Evens(IEnumerable<int> source)
{
    foreach (var x in source) if (x % 2 == 0) yield return x;
}

foreach (var n in Evens(Countdown(10))) { }   // нічого не матеріалізується; елементи йдуть по одному
```

Саме так працюють оператори LINQ to Objects на кшталт `Where` і `Select`.

## Обмеження

Ітератори не можуть мати параметрів `ref`, `out` чи `in` і не можуть містити `unsafe`-код. `ref struct`, як-от `Span<T>`, не можна використовувати через `yield`.

## Що сказати на співбесіді

- `yield return` змушує компілятор згенерувати енумератор-машину станів.
- Виконання відкладене й повторюється для кожного перелічення; перевіряйте аргументи одразу в обгортці.
- `finally` в ітераторі виконується, коли енумератор звільняють, а це гарантує `foreach`.
