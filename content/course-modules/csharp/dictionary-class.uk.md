`Dictionary<TKey, TValue>` зберігає пари: ключ і значення. Значення шукають за ключем приблизно за однаковий час, незалежно від кількості пар:

```csharp
var ages = new Dictionary<string, int>();
ages.Add("Ann", 30);
ages["Bob"] = 25;                        // додає або замінює

Console.WriteLine(ages["Ann"]);          // 30
Console.WriteLine(ages.ContainsKey("Cy"));   // False

int age;
if (ages.TryGetValue("Bob", out age))    // безпечний пошук, без винятку
{
    Console.WriteLine(age);              // 25
}

ages.Remove("Ann");
```

## Помилки й безпечний доступ

- `ages["Cy"]` кидає `KeyNotFoundException`, коли ключа немає. Перевіряйте через `ContainsKey` або використовуйте `TryGetValue`.
- `Add` кидає виняток, якщо ключ уже є. Індексатор `ages[key] = value` натомість замінює значення.
- Ключі мають бути унікальні. Значення — ні.

## Вартість

Пошук, вставка й видалення займають **O(1)** у середньому, бо хеш-код ключа вказує на кошик. Пошук потребує `GetHashCode` і `Equals` ключа, тому типи ключів мають коректно визначати обидва (наступні лекції показують як).

## Порядок

Порядок, у якому `foreach` віддає пари, **не гарантований** і може змінитися після видалень. Не покладайтеся на нього. Якщо потрібен упорядкований вивід, спершу відсортуйте ключі або використайте `SortedDictionary`.

```csharp
foreach (KeyValuePair<string, int> pair in ages)
{
    Console.WriteLine(pair.Key + " " + pair.Value);
}
```
