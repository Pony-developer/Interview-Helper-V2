**Узагальнений клас** має один або більше **параметрів типу** в кутових дужках. Клас пишеться один раз, а тип задають під час використання:

```csharp
class Box<T>
{
    private T content;

    public Box(T content)
    {
        this.content = content;
    }

    public T Get()
    {
        return content;
    }
}

var numbers = new Box<int>(42);
int n = numbers.Get();          // без приведення: компілятор знає, що це int

var words = new Box<string>("hi");
string w = words.Get();
```

`Box<int>` і `Box<string>` — два різні типи, зроблені з одного коду. `T` — це заповнювач: усередині класу `T` можна вживати як тип, але не можна викликати методи, яких може не бути в довільного типу.

## Обмеження

Щоб викликати метод для `T`, скажіть, яким має бути `T`, через **обмеження** (constraint):

```csharp
class SortedPair<T> where T : IComparable<T>
{
    public T Smaller;
    public T Larger;

    public SortedPair(T a, T b)
    {
        if (a.CompareTo(b) <= 0)
        {
            Smaller = a;
            Larger = b;
        }
        else
        {
            Smaller = b;
            Larger = a;
        }
    }
}

var p = new SortedPair<int>(9, 4);      // Smaller 4, Larger 9
```

Без `where T : IComparable<T>` виклик `a.CompareTo(b)` не компілюється, бо компілятор не знає, що в кожного `T` є цей метод.

Поширені обмеження: `where T : class` (посилальний тип), `where T : struct` (тип-значення), `where T : new()` (є конструктор без параметрів), `where T : базовий клас`.

## default(T)

Для параметра типу `default(T)` дає типове значення того типу, яким є `T`: `0` для `int`, `null` для `string`. Вживайте це, коли узагальненому коду потрібне «порожнє значення»:

```csharp
T empty = default(T);
```
