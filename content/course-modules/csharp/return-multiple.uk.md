Метод повертає одне значення. Щоб повернути **кілька** значень, є три поширені способи.

## Спосіб 1: параметри out

```csharp
static void SplitTime(int seconds, out int minutes, out int rest)
{
    minutes = seconds / 60;
    rest = seconds % 60;
}

int m, s;
SplitTime(125, out m, out s);
Console.WriteLine(m + ":" + s);        // 2:5
```

Кожен параметр `out` мусить бути присвоєний до повернення з методу. Так працює `int.TryParse`: він повертає `bool` і число разом.

## Спосіб 2: малий клас або структура

Коли результати належать одне одному, дайте їм назву:

```csharp
struct TimeParts
{
    public int Minutes;
    public int Seconds;
}

static TimeParts Split(int seconds)
{
    return new TimeParts { Minutes = seconds / 60, Seconds = seconds % 60 };
}

TimeParts t = Split(125);
Console.WriteLine(t.Minutes + ":" + t.Seconds);      // 2:5
```

Назви полів пояснюють, що означає кожне значення. Зазвичай це найзрозуміліший вибір.

## Спосіб 3: кортежі (C# 7)

У C# 7 з'явився короткий синтаксис для неназваної групи значень, `(int, int)`, з іменами на кшталт `(int minutes, int seconds)`. Метод повертає кортеж, а викликаючий читає його елементи за іменами:

```csharp
// синтаксис C# 7, наведено для довідки
static (int minutes, int seconds) Split(int total)
{
    return (total / 60, total % 60);
}

var t = Split(125);
Console.WriteLine(t.minutes + ":" + t.seconds);
```

Кортежі короткі, але вони не є назвою для групи, тож вживайте їх для локального допоміжного методу чи приватного методу. Публічний API з кількома значеннями зрозуміліший з іменованим типом.
