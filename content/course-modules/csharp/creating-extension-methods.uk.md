`Main` викликає кілька методів для рядків, масивів і чисел, яких немає в бібліотеці .NET. Напишіть їх як **методи розширення**, щоб виклики компілювалися.

Покладіть методи в **статичні класи над `Program`** (метод розширення має бути в статичному класі, не вкладеному в інший). Їхні назви й тип, який кожен розширює:

- `bool IsPalindrome(this string s)`: `true`, коли рядок читається однаково в обох напрямках, **ігноруючи регістр**. Порожній рядок — паліндром.
- `int WordCount(this string s)`: кількість слів, розділених довільною кількістю пробілів.
- `string Truncate(this string s, int maxLength)`: сам рядок, якщо він не довший за `maxLength`; інакше перші `maxLength − 3` символів і `...`, щоб результат мав рівно `maxLength` символів.
- `int Total(this int[] a)`: сума елементів (назву `Sum` уже використовує LINQ).
- `bool IsSorted(this int[] a)`: `true`, коли елементи йдуть за неспаданням. Порожній масив відсортований.
- `bool IsEven(this int n)`: `true` для парних чисел.

`Main` не змінюйте. Очікуваний вивід:

```text
True
False
True
3
Hello...
short
...
6
True
False
True
False
True
```

Рядки по порядку: `"Level"`, `"hello"` та `""` для `IsPalindrome`; `WordCount` для `"  many   spaces here "`; `Truncate` для `"Hello, World!"` до 8, для `"short"` до 10 та для `"abcdef"` до 3; `Total` для `{ 3, 1, 2 }`; `IsSorted` для `{ 1, 2, 3 }`, `{ 1, 3, 2 }` і порожнього масиву; та `IsEven` для 7 і 10.

Підказка: метод розширення — це `public static` у `static class`, а перший параметр має слово `this`. Для `WordCount` вистачить `s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length`.
