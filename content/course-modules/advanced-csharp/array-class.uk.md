## System.Array

Кожен тип масиву (`int[]`, `string[,]`, `Order[][]`) походить від абстрактного класу `System.Array`, що дає статичні методи для пошуку, сортування, копіювання та зміни розміру. Масиви — типи посилань, що виділяються одним суцільним блоком.

```csharp
int[] numbers = { 5, 3, 9, 1 };
int[,] grid = new int[3, 4];

numbers.Length;          // 4
grid.Length;             // 12: усього елементів
grid.Rank;               // 2 виміри
grid.GetLength(1);       // 4: розмір виміру 1
```

## Копіювання: поверхневе за природою

```csharp
int[] copy = (int[])numbers.Clone();          // новий масив, ті самі елементи
Order[] orders2 = (Order[])orders.Clone();     // новий масив, ТІ САМІ об'єкти Order (поверхнево)

Array.Copy(source, sourceIndex: 2, destination, destinationIndex: 0, length: 3);
numbers.CopyTo(target, 0);
numbers.AsSpan(1, 2).CopyTo(target);          // швидко, без повторних перевірок меж для кожного елемента
```

Щоб глибоко скопіювати масив об'єктів, копіювати кожен об'єкт доведеться самому.

## Пошук

```csharp
int idx = Array.IndexOf(numbers, 9);                   // лінійний, O(n); -1, якщо немає
bool any = Array.Exists(numbers, n => n > 8);
int firstBig = Array.Find(numbers, n => n > 4);        // default(T), якщо не знайдено
int[] bigOnes = Array.FindAll(numbers, n => n > 4);

Array.Sort(numbers);                                    // для двійкового пошуку має бути відсортовано
int pos = Array.BinarySearch(numbers, 9);              // O(log n); від'ємне, якщо немає
```

`BinarySearch` повертає **порозрядне доповнення** точки вставки, коли елемент не знайдено: `~pos` каже, куди його вставити.

## Сортування

```csharp
Array.Sort(numbers);                                   // природний порядок (IComparable)
Array.Sort(words, StringComparer.OrdinalIgnoreCase);   // з компаратором
Array.Sort(people, (a, b) => a.Age.CompareTo(b.Age));  // з лямбдою Comparison<T>
Array.Sort(keys, values);                               // відсортувати два масиви паралельно за ключами
Array.Reverse(numbers);
```

`Array.Sort` використовує **introsort** (quicksort + heapsort + сортування вставками): O(n log n) і **нестабільний**.

## Зміна розміру та заповнення

```csharp
Array.Resize(ref numbers, 10);        // виділяє новий масив і копіює; змінна оновлюється
Array.Fill(buffer, (byte)0xFF);       // .NET Core 2.0+
Array.Clear(buffer, 0, buffer.Length);
var empty = Array.Empty<int>();       // закешований масив нульової довжини: без алокації
```

## Перетворення та створення

```csharp
string[] texts = Array.ConvertAll(numbers, n => n.ToString());
Array dyn = Array.CreateInstance(typeof(int), 5);     // коли тип елемента відомий лише під час виконання
dyn.SetValue(42, 0);
```

## Масиви проти List<T>

| | Масив | `List<T>` |
| --- | --- | --- |
| Розмір | фіксований | росте (подвоює внутрішній масив) |
| Накладні витрати | мінімальні | об'єкт-обгортка + запасна місткість |
| Багатовимірні | так | ні |
| Спани/interop | природно | `CollectionsMarshal.AsSpan(list)` (.NET 5) |

Масиви — для даних фіксованого розміру, буферів і коду, критичного до продуктивності; `List<T>` — коли розмір змінюється.

## Що сказати на співбесіді

- `Clone` і `Array.Copy` — поверхневі.
- `BinarySearch` потребує відсортованих даних і повертає `~точкаВставки`, коли елемента немає.
- `Array.Resize` виділяє новий масив; `Array.Empty<T>()` уникає алокації порожніх масивів.
