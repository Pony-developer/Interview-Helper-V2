## Dictionary<TKey, TValue>

```csharp
var stock = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["pen"] = 10,
    ["ink"] = 0,
};

stock["pad"] = 7;                       // додати або перезаписати
stock.Add("pen", 1);                    // ArgumentException: ключ уже є
int pens = stock["pen"];                // KeyNotFoundException, якщо немає
if (stock.TryGetValue("cap", out int caps)) { }   // ідіоматичний пошук
stock.TryAdd("cap", 3);                 // .NET Core 2.0+: false, якщо вже є
stock.Remove("ink", out int removed);   // .NET Core 2.0+
foreach (var (key, value) in stock) { } // деконструкція KeyValuePair
```

Уникайте подвійного пошуку `if (d.ContainsKey(k)) x = d[k];`; беріть `TryGetValue`. Для оновлення на місці в .NET 6 є `CollectionsMarshal.GetValueRefOrAddDefault(dict, key, out bool exists)`, що повертає `ref` на комірку значення.

## Як працює хешування

1. `GetHashCode()` ключа (через `IEqualityComparer<TKey>` словника) обирає **кошик**: `hash % bucketCount`.
2. Кожен кошик вказує на ланцюжок записів; словник проходить його, порівнюючи через `Equals`.
3. Коли кількість записів досягає місткості, словник **збільшується** приблизно вдвічі (до простого числа) і перехешовує все: O(n) один раз, O(1) у середньому.

Наслідки:

- Пошук — O(1) **у середньому**. Погана хеш-функція (скажімо, завжди 0) погіршує його до O(n).
- **Ключі не можна змінювати** так, щоб це впливало на `GetHashCode`, поки вони в словнику; запис стає недосяжним.
- Порядок перелічення **не гарантований**. На практиці це порядок вставки, доки ви нічого не видаляли, але покладатися на це не можна.
- Хешування `string` у .NET Core **рандомізоване для кожного процесу** (захист від атак hash flooding), тож ніколи не зберігайте значення `string.GetHashCode()`.

## Як написати добрий GetHashCode

```csharp
public override int GetHashCode() => HashCode.Combine(Country, PostalCode, Street);
```

`HashCode.Combine` (.NET Core 2.1+) добре перемішує до восьми значень. Вимоги: рівні об'єкти → рівні хеші; обчислюється з незмінних даних; дешевий.

## Сортовані словники

| Тип | Структура | Вставка / видалення | Пошук | Пам'ять | Доступ за індексом |
| --- | --- | --- | --- | --- | --- |
| `Dictionary` | хеш-таблиця | O(1) | O(1) | помірно | ні |
| `SortedDictionary` | червоно-чорне дерево | O(log n) | O(log n) | більше (вузли) | ні |
| `SortedList` | два відсортовані масиви | O(n) | O(log n) | найменше | так (`Keys[i]`) |

`SortedList` — для даних, які будують один раз (чи додають по порядку) і багато читають; `SortedDictionary` — для частих вставок у випадковому порядку.

## Інші словники

- `ConcurrentDictionary<K,V>`: потокобезпечний, з `GetOrAdd` і `AddOrUpdate`. Фабрика значення під конкуренцією може виконатися більше одного разу.
- `ImmutableDictionary<K,V>` і `FrozenDictionary<K,V>` з .NET 8: оптимізовані для читання, ніколи не змінюються.
- `OrderedDictionary` (неузагальнений, застарілий): зберігає порядок вставки з доступом за індексом.
- `Lookup<K,V>` (з `ToLookup` у LINQ): один ключ → багато значень; відсутній ключ дає порожню послідовність замість винятку.

## Що сказати на співбесіді

- Пошук O(1) у середньому: хеш → кошик → `Equals`; залежить від доброго й стабільного `GetHashCode`.
- Використовуйте `TryGetValue`/`TryAdd`; не покладайтеся на порядок перелічення.
- `SortedDictionary` = дерево, `SortedList` = масиви; обирайте за характером вставок.
