Словник з власним класом-ключем працює лише тоді, коли клас визначає `GetHashCode` і `Equals` **узгоджено**. Ось клас-ключ `Coordinate`:

```csharp
class Coordinate
{
    public int Row { get; }
    public int Col { get; }

    public Coordinate(int row, int col) { Row = row; Col = col; }

    public override bool Equals(object obj)
    {
        Coordinate other = obj as Coordinate;
        if (other == null) return false;
        return Row == other.Row && Col == other.Col;
    }

    public override int GetHashCode()
    {
        unchecked
        {
            return Row * 31 + Col;           // ті самі поля, що й в Equals
        }
    }
}

var visited = new Dictionary<Coordinate, bool>();
visited[new Coordinate(1, 2)] = true;
Console.WriteLine(visited.ContainsKey(new Coordinate(1, 2)));   // True
```

## Правила

- **Рівні об'єкти мусять мати рівні хеш-коди.** Інакше словник шукає в неправильному кошику й не знаходить ключ.
- **В обох методах використовуйте ті самі поля.** Якщо `Equals` порівнює `Row` і `Col`, `GetHashCode` мусить використовувати їх і лише їх. Поле, яке `Equals` ігнорує, можна не брати до хешу, але воно не повинно вирішувати рівність.
- **Рівні хеші не означають рівні об'єкти.** Словник усе одно викликає `Equals` для підтвердження.

## Що йде не так без GetHashCode

Якщо перевизначити `Equals`, але не `GetHashCode`, клас успадковує типовий хеш, що базується на ідентичності об'єкта. Тоді дві рівні координати мають різні хеші, і пошук не вдається:

```csharp
// без GetHashCode:
visited[new Coordinate(1, 2)] = true;
Console.WriteLine(visited.ContainsKey(new Coordinate(1, 2)));   // False: інший кошик
```

Компілятор попереджає про це, тож уважно читайте попередження.

## Ключі не можна змінювати

Якщо поле ключа змінюється після того, як його додали до словника, змінюється і його хеш, і елемент губиться. Робіть ключі **незмінними**: використовуйте властивості лише для читання, а значення задавайте лише в конструкторі.

## Примітка про сучасний код

У .NET Core 2.1 і пізніших версіях структура `System.HashCode` допомагає поєднувати поля: `HashCode.Combine(Row, Col)`. У задачах курсу вживається ручний спосіб із множником `31`, що працює в кожній версії.
