## Поля

```csharp
class Account
{
    private decimal _balance;               // поле екземпляра
    public readonly string Id;              // присвоюється лише в оголошенні чи конструкторі
    public const int MaxNameLength = 50;    // константа часу компіляції, неявно static
    public static readonly DateTime Created = DateTime.UtcNow;  // обчислюється один раз під час виконання
}
```

`const` **вбудовується** в кожного викликача під час компіляції. Якщо бібліотека змінить `const`, споживачі бачитимуть старе значення, доки їх не перекомпілюють. Для всього, що може змінитися між версіями, використовуйте `static readonly`.

## Властивості

Властивість виглядає для викликача як поле, але має аксесори `get`/`set` (або `init`).

```csharp
public string Name { get; set; }                    // автовластивість
public decimal Balance { get; private set; }        // ззовні лише для читання
public DateTime OpenedOn { get; init; }             // C# 9: задається лише під час ініціалізації
public bool IsEmpty => Balance == 0;                // з тілом-виразом, обчислювана

private int _age;
public int Age
{
    get => _age;
    set => _age = value >= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
}
```

`init` дає незмінні об'єкти, які все ще підтримують синтаксис ініціалізатора: `new Account { OpenedOn = today }` працює, а `acc.OpenedOn = x` згодом — ні.

## Індексатори

```csharp
class Sentence
{
    private readonly string[] _words;
    public Sentence(string text) => _words = text.Split(' ');
    public string this[int index]
    {
        get => _words[index];
        set => _words[index] = value;
    }
    public string this[Index i] => _words[i];   // підтримує s[^1]
}
```

## Конструктори

```csharp
class Order
{
    public Order(int id) : this(id, DateTime.UtcNow) { }   // ланцюжок до іншого конструктора
    public Order(int id, DateTime placed) { Id = id; Placed = placed; }
    static Order() { /* виконується один раз, перед першим використанням типу */ }
    public int Id { get; }
    public DateTime Placed { get; }
}
```

- Якщо ви не написали жодного конструктора, компілятор додасть публічний без параметрів.
- **Ініціалізатори полів виконуються перед тілом конструктора**, у порядку оголошення.
- Статичний конструктор виконується раз на тип, автоматично, до створення першого екземпляра чи використання статичного члена. Виняток у ньому робить тип непридатним на весь час роботи програми.

## Ініціалізатори об'єктів і деконструктори

```csharp
var o = new Order(1) { Note = "gift" };   // задати доступні властивості після конструктора

public void Deconstruct(out int id, out DateTime placed) { id = Id; placed = Placed; }
var (id, when) = order;                  // викликає Deconstruct
```

## Partial-типи та методи

`partial` розбиває клас на кілька файлів; так дизайнери й генератори коду додають код поруч із вашим. `partial`-метод, оголошений без тіла, повністю видаляється, якщо його ніхто не реалізував.

## nameof

`nameof(Balance)` дає рядок `"Balance"` під час компіляції, тож рефакторинг перейменування оновить і його. Використовуйте у винятках і логуванні.

## Що сказати на співбесіді

- Віддавайте перевагу властивостям, а не публічним полям: згодом можна додати валідацію, не ламаючи викликачів.
- `init` + `readonly`-поля дають незмінність без втрати синтаксису ініціалізатора.
- Ініціалізатори полів виконуються перед тілом конструктора; статичні конструктори — один раз і ліниво.
