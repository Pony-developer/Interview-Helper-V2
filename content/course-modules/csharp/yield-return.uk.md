Писати перелічувач вручну довго. Ключове слово **`yield return`** дозволяє написати метод, що видає послідовність елемент за елементом, а перелічувач за вас будує компілятор.

```csharp
static IEnumerable<int> Evens(int limit)
{
    for (int i = 0; i <= limit; i += 2)
    {
        yield return i;               // віддає один елемент і зупиняється тут
    }
}

foreach (int n in Evens(6))
{
    Console.Write(n + " ");           // 0 2 4 6
}
```

Метод повертає `IEnumerable<int>`, а його тіло містить `yield return`. Більше в ньому нічого особливого немає. Щоразу, коли `foreach` просить наступний елемент, метод виконується від місця, де зупинився, до наступного `yield return`.

## Що відбувається крок за кроком

```csharp
static IEnumerable<string> Demo()
{
    Console.WriteLine("start");
    yield return "first";
    Console.WriteLine("middle");
    yield return "second";
    Console.WriteLine("end");
}

foreach (string s in Demo())
{
    Console.WriteLine("got " + s);
}
// start
// got first
// middle
// got second
// end
```

Вивід показує, що код методу виконується **перемежовано** з циклом. Нічого не виконується, коли викликають `Demo()`. Тіло починає працювати, лише коли `foreach` просить перший елемент.

## yield break

`yield break` завершує послідовність раніше, без значення:

```csharp
static IEnumerable<int> UntilNegative(int[] items)
{
    foreach (int x in items)
    {
        if (x < 0)
        {
            yield break;              // послідовність закінчується тут
        }
        yield return x;
    }
}
```

## Правила

- Метод мусить повертати `IEnumerable<T>`, `IEnumerator<T>` або їх негенеричні версії.
- Він не може використовувати `return значення;`. Для кожного елемента вживайте `yield return`.
- Це може бути метод, але не лямбда у звичному розумінні, і він не може мати параметрів `out` чи `ref`.

Наступна лекція показує, чому лінивість важлива.

## Особливі випадки

### 1. Метод не виконується під час виклику

```csharp
static IEnumerable<int> Parse(string[] items)
{
    foreach (string s in items)
    {
        if (s == "") throw new ArgumentException("empty item");
        yield return int.Parse(s);
    }
}

var numbers = Parse(new[] { "1", "" });    // тут винятку немає!
foreach (int n in numbers)                 // виняток виникає тут, під час перелічування
{
    Console.WriteLine(n);
}
```

Оскільки тіло виконується лише під час перелічування, перевірка аргументів у ітераторі **відкладається**. Помилка з'являється далеко від виклику, що її спричинив. Звичайне виправлення — розділити метод на два: звичайний публічний метод, що одразу перевіряє аргументи, і приватний ітератор, що виконує роботу:

```csharp
static IEnumerable<int> Parse(string[] items)
{
    if (items == null) throw new ArgumentNullException("items");   // перевіряється одразу
    return ParseIterator(items);
}

static IEnumerable<int> ParseIterator(string[] items)
{
    foreach (string s in items)
    {
        yield return int.Parse(s);
    }
}
```

### 2. try з catch заборонено

`yield return` не може стояти в блоці `try`, що має `catch`. Компілятор повідомляє про помилку. `try` лише з `finally` дозволений:

```csharp
static IEnumerable<int> Read()
{
    // try { yield return 1; } catch (Exception) { }   // помилка компіляції
    try
    {
        yield return 1;
    }
    finally
    {
        Console.WriteLine("cleanup");     // виконується, коли перелічування завершується
    }
}
```

### 3. Інші обмеження

- Оператор `return значення;` не дозволений, лише `yield return` і `yield break`.
- Параметри `out` і `ref` не дозволені.
- Не можна використовувати `yield return` у блоках `catch` та `finally`.

### Практичний підсумок

Ітератор — це **лінива програма**: вона працює частинами, коли її просять. Перевіряйте аргументи в звичайному методі, а ітератор тримайте малим і сфокусованим.
