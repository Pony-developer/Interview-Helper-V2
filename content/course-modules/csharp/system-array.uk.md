Допоміжні методи класу `Array` ви вже знаєте: `Array.Sort`, `Array.IndexOf`, `Array.Copy` та інші. Тепер подивімося на клас з погляду **успадкування**: `System.Array` — це **базовий клас кожного масиву** в C#.

```csharp
int[] numbers = { 3, 1, 2 };
string[] words = { "b", "a" };
int[,] grid = new int[2, 2];

Array a1 = numbers;                        // int[] походить від Array
Array a2 = words;                          // string[] теж
Array a3 = grid;                           // і двовимірний масив також
object o = numbers;                        // а Array походить від object
```

Тож змінна типу `Array` може тримати **масив будь-якого типу елементів і з будь-якою кількістю вимірів**. Це зручно для коду, якому байдуже, що всередині.

## Метод для будь-якого масиву

```csharp
static void PrintInfo(Array array)
{
    Console.WriteLine(array.GetType().Name + ": " + array.Length + " elements, " + array.Rank + " dimension(s)");
}

PrintInfo(new int[5]);                     // Int32[]: 5 elements, 1 dimension(s)
PrintInfo(new string[2, 3]);               // String[,]: 6 elements, 2 dimension(s)
```

Що `Array` дає кожному масиву:

- `Length`: загальна кількість елементів в усіх вимірах;
- `Rank`: кількість вимірів;
- `GetLength(d)`: розмір виміру `d`;
- `GetValue(i)` і `SetValue(value, i)`: читання та запис елемента за індексом, як `object`;
- `Clone()`: поверхова копія (повертає `object`, тож потрібне приведення);
- `CopyTo(target, index)`: копіювання елементів в інший масив.

## `foreach` по `Array`

`Array` можна вживати у `foreach`. Елементи виходять як `object`, по одному, **в усіх вимірах**:

```csharp
static string Show(Array array)
{
    string text = "";
    foreach (object item in array)
    {
        text += item + " ";
    }
    return text.Trim();
}

Console.WriteLine(Show(new[] { 1, 2, 3 }));                  // 1 2 3
Console.WriteLine(Show(new[] { "x", "y" }));                 // x y
Console.WriteLine(Show(new int[,] { { 1, 2 }, { 3, 4 } }));  // 1 2 3 4
```

Метод працює для всіх масивів, а ми написали його раз. Це та сама ідея, що й `Greet(Person)` на початку модуля: один **базовий тип** замість копії методу на кожен випадок.

## Array.Copy для будь-якого масиву

Метод `Array.Copy` приймає два параметри `Array`, тож теж працює для всіх типів елементів:

```csharp
int[] source = { 1, 2, 3, 4, 5 };
int[] part = new int[3];
Array.Copy(source, 1, part, 0, 3);         // від source[1], у part[0], 3 елементи
Console.WriteLine(string.Join(" ", part)); // 2 3 4
```

Аргументи: вихідний масив, початковий індекс у ньому, цільовий масив, початковий індекс у ньому, кількість елементів. Цільовий масив має бути **достатньо великим** і вже існувати: `Array.Copy` його не створює.

Коли потрібен **новий** масив типу, якого ви не знаєте під час компіляції, є `Array.CreateInstance(elementType, length)`. Він потрібен рідко, але показує, що типи масивів — справжні типи, про які можна запитати під час виконання:

```csharp
Array created = Array.CreateInstance(typeof(int), 3);
created.SetValue(7, 0);
Console.WriteLine(created.GetValue(0));    // 7
```

## Коваріантність масивів: пастка

`string[]` можна вжити як `object[]`, бо `string` походить від `object`:

```csharp
object[] objects = new string[] { "a", "b" };      // компілюється
objects[0] = "c";                                   // добре
objects[1] = 42;                                    // ArrayTypeMismatchException під час виконання!
```

Справжній масив досі `string[]`, і він відмовляється приймати `int`. Компілятор цього не бачить. Тому масиви посилальних типів так використовують обережно. З масивом значущого типу так не вийде: `int[]` **не** є `object[]`, але **є** `Array`.
