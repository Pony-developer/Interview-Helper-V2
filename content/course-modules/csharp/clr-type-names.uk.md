Середовище виконання називає типи інакше, ніж C#: `int` — це `Int32`, `int[]` — `Int32[]`, `List<int>` — `` List`1 ``, а `int?` — `` Nullable`1 ``. Саме ці CLR-імена показують повідомлення про помилки, логи й рефлексія. Напишіть `CSharpName(Type type)`, що перетворює `Type` назад на ім'я, яке ви написали б у C#:

- тип зі словника `Aliases` отримує своє ключове слово C#. Поки що в словнику лише `int` і `string`: додайте інші ключові слова, потрібні `Main`;
- масив отримує C#-ім'я типу свого елемента, а за ним `[]` (`type.IsArray`, `type.GetElementType()`);
- `Nullable<T>` стає C#-ім'ям `T`, а за ним `?`. Перевірте це умовою `type.GetGenericTypeDefinition() == typeof(Nullable<>)`;
- будь-який інший узагальнений тип (`type.IsGenericType`) отримує своє ім'я без суфікса арності `` `N ``, а потім у кутових дужках C#-імена своїх аргументів типу (`type.GetGenericArguments()`), розділені `", "`;
- будь-який інший тип лишає `type.Name`.

Аргументи типу й елементи масиву самі можуть бути узагальненими, тож метод викликає сам себе. Не змінюйте `Main`. Очікуваний вивід:

```text
Int32 -> int
String -> string
Boolean -> bool
Object -> object
DateTime -> DateTime
Double[] -> double[]
List`1 -> List<int>
Dictionary`2 -> Dictionary<string, List<long>>
Nullable`1 -> int?
KeyValuePair`2[] -> KeyValuePair<char, decimal>[]
```

Підказка: спершу перевірте псевдонім, потім масив, потім узагальнений тип. `` type.Name.IndexOf('`') `` знаходить, де починається суфікс арності.
