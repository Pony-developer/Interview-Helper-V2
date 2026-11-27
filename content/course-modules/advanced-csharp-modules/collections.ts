import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const lruTypes = (body: string) => `// A least-recently-used cache: Get and Put are O(1). When full, Put evicts the entry used least recently.
class LruCache<TKey, TValue>
{
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<KeyValuePair<TKey, TValue>>> _map;
    private readonly LinkedList<KeyValuePair<TKey, TValue>> _order;   // most recent first

    public LruCache(int capacity)
    {
        _capacity = capacity;
        _map = new Dictionary<TKey, LinkedListNode<KeyValuePair<TKey, TValue>>>();
        _order = new LinkedList<KeyValuePair<TKey, TValue>>();
    }

    public int Count { get { return _map.Count; } }

    // Returns true and the value if present, and marks the key as most recently used.
    public bool TryGet(TKey key, out TValue value)
    {
${body.split("@@")[0]}
    }

    // Adds or replaces a value and marks it most recently used; evicts the least recent entry if over capacity.
    public void Put(TKey key, TValue value)
    {
${body.split("@@")[1]}
    }

    public IEnumerable<TKey> KeysByRecency()
    {
        foreach (var pair in _order) yield return pair.Key;
    }
}`;

const lruSolution = `        LinkedListNode<KeyValuePair<TKey, TValue>> node;
        if (!_map.TryGetValue(key, out node))
        {
            value = default(TValue);
            return false;
        }
        _order.Remove(node);
        _order.AddFirst(node);
        value = node.Value.Value;
        return true;@@        LinkedListNode<KeyValuePair<TKey, TValue>> existing;
        if (_map.TryGetValue(key, out existing))
        {
            _order.Remove(existing);
            _map.Remove(key);
        }
        else if (_map.Count == _capacity)
        {
            var last = _order.Last;
            _order.RemoveLast();
            _map.Remove(last.Value.Key);
        }
        var node = _order.AddFirst(new KeyValuePair<TKey, TValue>(key, value));
        _map[key] = node;`;

const lruMain = `        var cache = new LruCache<string, int>(3);
        cache.Put("a", 1);
        cache.Put("b", 2);
        cache.Put("c", 3);
        int v;
        Console.WriteLine(cache.TryGet("a", out v) + " " + v);
        cache.Put("d", 4);                         // evicts b (least recently used)
        Console.WriteLine(cache.TryGet("b", out v) + " " + v);
        cache.Put("c", 30);                        // update moves c to the front
        Console.WriteLine(string.Join(",", cache.KeysByRecency()) + " count=" + cache.Count);
        cache.Put("e", 5);                         // evicts a
        Console.WriteLine(string.Join(",", cache.KeysByRecency()));
        Console.WriteLine(cache.TryGet("c", out v) + " " + v);`;

const inventoryTypes = (body: string) => `class Product
{
    public string Sku { get; private set; }
    public string Name { get; private set; }
    public int Stock { get; set; }
    public Product(string sku, string name, int stock) { Sku = sku; Name = name; Stock = stock; }
}

// Products are looked up by SKU, ignoring case ("ab-1" finds "AB-1"); insertion order is kept.
class Inventory : KeyedCollection<string, Product>
{
    public Inventory() : base(StringComparer.OrdinalIgnoreCase) { }

    protected override string GetKeyForItem(Product item)
    {
${body.split("@@")[0]}
    }

    // Rejects products with negative stock (ArgumentException) before they are stored.
    protected override void InsertItem(int index, Product item)
    {
${body.split("@@")[1]}
    }
}`;

const inventoryMain = `        var inv = new Inventory();
        inv.Add(new Product("AB-1", "Pen", 10));
        inv.Add(new Product("cd-2", "Ink", 0));
        inv.Add(new Product("EF-3", "Pad", 7));
        Console.WriteLine(inv["ab-1"].Name + " " + inv["CD-2"].Name);
        Console.WriteLine(inv.Contains("ef-3") + " " + inv.Contains("zz-9"));
        Console.WriteLine(inv[2].Name);
        try { inv.Add(new Product("ab-1", "Duplicate", 1)); }
        catch (ArgumentException) { Console.WriteLine("duplicate rejected"); }
        try { inv.Add(new Product("XY-0", "Broken", -1)); }
        catch (ArgumentException e) { Console.WriteLine(e.Message); }
        inv.Remove("CD-2");
        foreach (var p in inv) Console.Write(p.Sku + " ");
        Console.WriteLine(inv.Count);`;

const inventorySolution = `        return item.Sku;@@        if (item.Stock < 0) throw new ArgumentException("Stock can't be negative: " + item.Sku);
        base.InsertItem(index, item);`;

export const collectionsModule: ModuleDef = {
  slug: "collections",
  title: { en: "Collections", uk: "Колекції" },
  slides: [
    lecture("collection-interfaces", "The collection interfaces", "Інтерфейси колекцій"),
    lecture("array-class", "The Array class", "Клас Array"),
    lecture("lists-queues-sets", "Lists, queues, stacks and sets", "Списки, черги, стеки та множини"),
    lecture("dictionaries-deep", "Dictionaries and how hashing works", "Словники та як працює хешування"),
    lecture("custom-immutable-collections", "Custom, read-only and immutable collections", "Власні, read-only та незмінні колекції"),
    quiz("collections-quiz", "Collections", "Колекції", [
      question(
        "list-insert",
        ["What is the cost of `list.Insert(0, x)` on a `List<T>` with n items?", "Яка вартість `list.Insert(0, x)` для `List<T>` з n елементами?"],
        [
          ["O(1)", "O(1)"],
          ["O(n): every element is shifted one position to the right", "O(n): кожен елемент зсувається на одну позицію праворуч"],
          ["O(log n)", "O(log n)"],
          ["O(n²)", "O(n²)"],
        ],
        "b",
      ),
      question(
        "dict-lookup",
        ["Why is a `Dictionary<TKey, TValue>` lookup O(1) on average?", "Чому пошук у `Dictionary<TKey, TValue>` у середньому O(1)?"],
        [
          ["It keeps keys sorted", "Він тримає ключі відсортованими"],
          ["It scans all keys in parallel", "Він сканує всі ключі паралельно"],
          ["The key's hash code picks a bucket directly; only the few keys in that bucket are compared with `Equals`", "Хеш-код ключа одразу вказує на кошик; з `Equals` порівнюються лише кілька ключів у цьому кошику"],
          ["It uses a binary tree", "Він використовує бінарне дерево"],
        ],
        "c",
      ),
      question(
        "mutable-key",
        ["You store an object as a dictionary key and then change a field used by its `GetHashCode`. What happens?", "Ви зберегли об'єкт як ключ словника, а потім змінили поле, що бере участь у `GetHashCode`. Що станеться?"],
        [
          ["The dictionary rehashes it automatically", "Словник автоматично перехешує його"],
          ["An exception is thrown immediately", "Одразу кидається виняток"],
          ["Nothing, keys are copied", "Нічого, ключі копіюються"],
          ["The entry becomes unreachable: lookups search the wrong bucket", "Запис стає недосяжним: пошук іде не в той кошик"],
        ],
        "d",
      ),
      question(
        "sorted",
        ["Which collection keeps keys sorted with O(log n) insert and lookup?", "Яка колекція тримає ключі відсортованими зі вставкою й пошуком за O(log n)?"],
        [
          ["`SortedDictionary<TKey, TValue>` (a red-black tree)", "`SortedDictionary<TKey, TValue>` (червоно-чорне дерево)"],
          ["`Dictionary<TKey, TValue>`", "`Dictionary<TKey, TValue>`"],
          ["`HashSet<T>`", "`HashSet<T>`"],
          ["`Queue<T>`", "`Queue<T>`"],
        ],
        "a",
      ),
      question(
        "readonly-vs-immutable",
        ["What is the difference between `ReadOnlyCollection<T>` and `ImmutableList<T>`?", "Чим відрізняються `ReadOnlyCollection<T>` та `ImmutableList<T>`?"],
        [
          ["None", "Нічим"],
          ["A read-only collection is a view: the owner can still change the underlying list. An immutable list can never change; \"modifications\" return new lists", "Read-only колекція — це представлення: власник досі може змінювати внутрішній список. Незмінний список не може змінитися ніколи; «зміни» повертають нові списки"],
          ["`ImmutableList<T>` is a struct", "`ImmutableList<T>` — структура"],
          ["`ReadOnlyCollection<T>` is thread-unsafe, `ImmutableList<T>` is slow to read", "`ReadOnlyCollection<T>` не потокобезпечна, а `ImmutableList<T>` повільно читається"],
        ],
        "b",
      ),
      question(
        "capacity",
        ["Why pass a capacity to `new List<T>(10_000)` when you know the size?", "Навіщо передавати місткість у `new List<T>(10_000)`, коли розмір відомий?"],
        [
          ["It makes the list read-only", "Список стає лише для читання"],
          ["It limits the list to 10,000 items", "Список обмежується 10 000 елементів"],
          ["It avoids repeated reallocations and copying as the internal array doubles", "Це уникає повторних перевиділень і копіювань, коли внутрішній масив подвоюється"],
          ["It sorts the list", "Список сортується"],
        ],
        "c",
      ),
      question(
        "queue-stack",
        ["Which statements are true?", "Які твердження правдиві?"],
        [
          ["`Queue<T>` is FIFO: `Dequeue` returns the oldest item", "`Queue<T>` — FIFO: `Dequeue` повертає найстаріший елемент"],
          ["`Stack<T>` is LIFO: `Pop` returns the newest item", "`Stack<T>` — LIFO: `Pop` повертає найновіший елемент"],
          ["`PriorityQueue<TElement, TPriority>` (.NET 6) dequeues the element with the lowest priority value first", "`PriorityQueue<TElement, TPriority>` (.NET 6) першим видає елемент з найменшим значенням пріоритету"],
          ["`HashSet<T>` keeps items in insertion order", "`HashSet<T>` зберігає елементи в порядку вставки"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "array-covariance",
        ["What does `Array.Resize(ref arr, 10)` actually do?", "Що насправді робить `Array.Resize(ref arr, 10)`?"],
        [
          ["Grows the array in place", "Збільшує масив на місці"],
          ["Allocates a new array, copies the elements and points `arr` at it", "Виділяє новий масив, копіює елементи й змушує `arr` вказувати на нього"],
          ["Throws, arrays have a fixed size", "Кидає виняток, масиви мають фіксований розмір"],
          ["Creates a view over the old array", "Створює представлення над старим масивом"],
        ],
        "b",
      ),
    ]),
    practice("lru-cache-practice", "An LRU cache", "LRU-кеш", {
      starter: PROGRAM_WITH(lruTypes(`${TODO}@@${TODO}`), lruMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(lruTypes(lruSolution), lruMain, "using System.Collections.Generic;"),
      expectedOutput: "True 1\nFalse 0\nc,d,a count=3\ne,c,d\nTrue 30\n",
    }),
    practice("keyed-collection-practice", "A keyed, case-insensitive inventory", "Інвентар із ключами без урахування регістру", {
      starter: PROGRAM_WITH(inventoryTypes(`${TODO}@@${TODO}`), inventoryMain, "using System.Collections.ObjectModel;"),
      solution: PROGRAM_WITH(inventoryTypes(inventorySolution), inventoryMain, "using System.Collections.ObjectModel;"),
      expectedOutput: "Pen Ink\nTrue False\nPad\nduplicate rejected\nStock can't be negative: XY-0\nAB-1 EF-3 2\n",
    }),
  ],
};
