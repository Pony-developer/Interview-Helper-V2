Клас можна використати в `foreach`, якщо він реалізує `IEnumerable<T>`. Ось колекція чисел від `from` до `to`, написана без жодного вбудованого списку:

```csharp
class Range : IEnumerable<int>
{
    private readonly int from;
    private readonly int to;

    public Range(int from, int to)
    {
        this.from = from;
        this.to = to;
    }

    public IEnumerator<int> GetEnumerator()
    {
        return new RangeEnumerator(from, to);
    }

    // Негенеричний метод також вимагає інтерфейс
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}

class RangeEnumerator : IEnumerator<int>
{
    private readonly int from;
    private readonly int to;
    private int current;
    private bool started;

    public RangeEnumerator(int from, int to)
    {
        this.from = from;
        this.to = to;
        current = from - 1;               // «перед першим елементом»
    }

    public int Current { get { return current; } }

    object IEnumerator.Current { get { return Current; } }

    public bool MoveNext()
    {
        if (current < to)
        {
            current++;
            return true;
        }
        return false;
    }

    public void Reset()
    {
        current = from - 1;
    }

    public void Dispose() { }
}
```

```csharp
foreach (int n in new Range(3, 6))
{
    Console.Write(n + " ");           // 3 4 5 6
}
```

## Схема

- **Колекція** (`Range`) вміє лише створювати перелічувачі.
- **Перелічувач** (`RangeEnumerator`) тримає позицію. Кожен його об'єкт обходить послідовність один раз.
- `MoveNext` пересуває позицію й каже, чи є елемент. `Current` його повертає.

Два перелічувачі однієї колекції незалежні: кожен має власну позицію, тож вкладені цикли `foreach` по одному `Range` працюють правильно.

## Поле `started`

У класі вище оголошено `started`, але воно не потрібне, бо `current` починається на крок перед першим елементом. Це один поширений дизайн; інший тримає прапорець стану. Оберіть той, що робить логіку зрозумілішою, а невикористані поля прибирайте.

## Наступний крок

Писати перелічувач вручну довго. Ключове слово `yield return` змушує компілятор написати цей клас за вас, як показують наступні лекції.
