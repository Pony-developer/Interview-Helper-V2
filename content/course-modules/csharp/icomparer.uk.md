`IComparable<T>` дає класові **один** природний порядок. Але ті самі книжки в різні моменти можуть потребувати різних порядків: за роком для каталогу, за назвою для читача, за ціною для магазину. А іноді клас **не ваш**, тож додати до нього `CompareTo` не можна.

Інтерфейс **`IComparer<T>`** виносить порівняння **за межі** класу, в окремий малий об'єкт — **компаратор**:

```csharp
interface IComparer<T>
{
    int Compare(T x, T y);                 // той самий контракт, що й CompareTo: від'ємне / 0 / додатне
}
```

Простір назв — `System.Collections.Generic`, тож у файлі потрібен `using System.Collections.Generic;`.

## Написання компаратора

```csharp
class Book
{
    public string Title { get; }
    public int Year { get; }

    public Book(string title, int year) { Title = title; Year = year; }
}

class ByTitle : IComparer<Book>
{
    public int Compare(Book x, Book y)
    {
        return string.CompareOrdinal(x.Title, y.Title);
    }
}

class ByYearDescending : IComparer<Book>
{
    public int Compare(Book x, Book y)
    {
        return y.Year.CompareTo(x.Year);               // операнди поміняно: найновіші першими
    }
}
```

## Використання компаратора

Передайте його другим аргументом методів сортування:

```csharp
Book[] books = { new Book("Emma", 1815), new Book("Dune", 1965), new Book("Ulysses", 1922) };

Array.Sort(books, new ByTitle());                      // Dune, Emma, Ulysses
Array.Sort(books, new ByYearDescending());             // Dune (1965), Ulysses (1922), Emma (1815)

var list = new List<Book>(books);
list.Sort(new ByTitle());                              // те саме для списків
```

Сам клас `Book` не змінився. Один клас — багато порядків: заради цього й існує інтерфейс.

## Компаратор із налаштуванням

Компаратор — звичайний об'єкт, тож може мати **поля** та конструктор:

```csharp
class ByDistanceFrom : IComparer<int>
{
    private readonly int center;

    public ByDistanceFrom(int center) { this.center = center; }

    public int Compare(int x, int y)
    {
        return Math.Abs(x - center).CompareTo(Math.Abs(y - center));
    }
}

int[] numbers = { 10, 3, 7, 5, 1 };
Array.Sort(numbers, new ByDistanceFrom(6));            // спершу 5 і 7 (в одному з порядків), потім 3, 10, 1: відстані 1 1 3 4 5
```

Зверніть увагу, що `5` і `7` для цього компаратора **рівні** (обидва на відстані 1). Сортування може залишити рівні елементи в **будь-якому** порядку, тож не розраховуйте на порядок між ними. Якщо потрібна фіксована відповідь, додайте **друге правило**, як у `CompareTo` з кількома полями.

## Коротше: порівняння як лямбда

Для одноразового порядку писати цілий клас важко. `Array.Sort` і `List.Sort` також приймають **лямбду** — коротку функцію, записану на місці:

```csharp
Array.Sort(books, (a, b) => string.CompareOrdinal(a.Title, b.Title));
```

Це означає: «для `a` і `b` результат такий...». Вона робить те саме, що й клас-компаратор, а порівняння видно саме там, де його вживають. Клас кращий, коли порядок використовують у багатьох місцях, він має налаштування або його тестують окремо.

## IComparable чи IComparer?

| | `IComparable<T>` | `IComparer<T>` |
|---|---|---|
| Хто реалізує | Клас, який порівнюють | Окремий клас |
| Скільки порядків | Один, «природний» | Скільки завгодно |
| Потрібен доступ до коду класу | Так | Ні |
| Використання | `Array.Sort(items)` | `Array.Sort(items, comparer)` |

Дайте класові природний порядок через `IComparable<T>`, якщо є очевидний, а для всіх інших порядків додайте компаратори.

## Ще одне: стабільний результат

Коли два об'єкти «рівні» за порядком, `Array.Sort` може їх поміняти місцями. Якщо вивід має бути однаковим при кожному запуску, зробіть порядок **повним**: порівнюйте за наступним полем, доки два об'єкти не можна буде розрізнити. У задачах цього курсу це добра звичка, бо відповідь порівнюється з очікуваним текстом точно.
