Масив має фіксований розмір. Коли наперед невідомо, скільки буде елементів, або їх потрібно додавати й видаляти, використовуйте `List<T>`. Він міститься в `System.Collections.Generic`, тож у файлі потрібен `using System.Collections.Generic;`.

```csharp
List<int> numbers = new List<int>();
var names = new List<string> { "Ann", "Bo", "Cy" };   // з початковими значеннями
```

`T` — це тип елементів, і його обирають під час створення списку: список `int`, `string`, навіть список списків.

## Основи

```csharp
var items = new List<string>();
items.Add("tea");            // tea
items.Add("coffee");         // tea, coffee
items.Insert(1, "milk");     // tea, milk, coffee
items.Remove("milk");        // tea, coffee  (видаляє перший збіг)
items.RemoveAt(0);           // coffee       (видаляє за позицією)

Console.WriteLine(items.Count);        // 1   (Count, а не Length)
Console.WriteLine(items[0]);           // coffee
items[0] = "cocoa";                    // заміна за індексом
```

Елементи читаються й записуються через `[ ]`, точно як у масиві, і індекси також починаються з 0. Вихід за межі списку кидає `ArgumentOutOfRangeException`.

## Пошук

```csharp
var list = new List<int> { 5, 8, 5, 2 };
list.Contains(8);       // True
list.IndexOf(5);        // 0: перша позиція, або -1, якщо немає
list.LastIndexOf(5);    // 2
```

## Зміна всього списку

```csharp
list.Sort();            // 2 5 5 8, на місці
list.Reverse();         // 8 5 5 2
list.AddRange(new[] { 1, 1 });   // додає кілька одразу
list.Clear();           // спорожнює список
```

## Перетворення

```csharp
int[] array = list.ToArray();                 // список у масив
var copy = new List<int>(array);              // масив (або інший список) у новий список
```

Зверніть увагу: `new List<int>(other)` створює **незалежну копію**, а `var same = other;` лише дає списку друге ім'я (ті самі правила, що й для масивів).

## Обхід списку

```csharp
foreach (int n in list)
{
    Console.WriteLine(n);
}

for (int i = 0; i < list.Count; i++)
{
    Console.WriteLine(i + ": " + list[i]);
}
```

**Не додавайте й не видаляйте елементи всередині `foreach` по тому самому списку.** Наступний крок кине `InvalidOperationException`: «Collection was modified». Якщо потрібно змінювати список під час обходу, використайте цикл `for`, що рахує **назад**, щоб видалення не зсували елементи, яких ви ще не бачили:

```csharp
for (int i = list.Count - 1; i >= 0; i--)
{
    if (list[i] % 2 == 0)
    {
        list.RemoveAt(i);    // видаляє парні числа
    }
}
```

Або побудуйте **новий** список з елементів, які хочете лишити.

## Як це працює всередині

`List<T>` тримає всередині звичайний масив. Коли масив заповнюється, список створює більший (приблизно удвічі) і копіює все туди. Тому `Add` у кінець у середньому швидкий, а `Insert` і `RemoveAt` біля початку повільніші: їм доводиться зсувати елементи після себе.

`Count` — кількість елементів у списку. `Capacity` — розмір внутрішнього масиву, і потрібен він рідко.

## Список чи масив?

| | Масив | List&lt;T&gt; |
| --- | --- | --- |
| Розмір | фіксований | росте й зменшується |
| Довжина | `Length` | `Count` |
| Додати / видалити | ні | так |
| Багатовимірність | так | ні (використайте список списків) |
| Коли | розмір відомий і сталий | розмір змінюється або невідомий |

**Список списків** дає таблицю з рядками різної довжини:

```csharp
var table = new List<List<int>>();
table.Add(new List<int> { 1, 2 });
table.Add(new List<int> { 3 });
Console.WriteLine(table[0][1]);   // 2
```

## Типові помилки

- Використання `Length` замість `Count` або `Count` для масиву.
- Виклик `Remove` без розуміння, що він видаляє лише **перший** збіг і повертає `false`, коли нічого не знайдено.
- Створення списку як `null` замість `new List<T>()` і подальший виклик `Add` для `null`.
- Зміна списку під час `foreach`.
