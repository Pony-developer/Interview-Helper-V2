## Тип усередині типу

```csharp
public class LinkedStack<T>
{
    private Node _head;

    private class Node              // вкладений, private: невидимий поза LinkedStack
    {
        public T Value;              // може використовувати параметр типу T зовнішнього класу
        public Node Next;
    }

    public void Push(T value) => _head = new Node { Value = value, Next = _head };

    public T Pop()
    {
        if (_head == null) throw new InvalidOperationException("Stack is empty");
        T value = _head.Value;
        _head = _head.Next;
        return value;
    }
}
```

## Що дає вкладення

- **Доступ до приватних членів охопного типу.** Вкладений клас може читати й писати приватні поля зовнішнього класу (маючи екземпляр).
- **Будь-який модифікатор доступу.** Типи верхнього рівня можуть бути лише `public` або `internal`; вкладені — ще й `private`, `protected`, `private protected` чи `protected internal`. За замовчуванням вкладений тип `private`.
- **Параметри узагальнення зовнішнього типу.** У прикладі `Node` використовує `T`, не оголошуючи його.
- **Область видимості.** Зовнішній код звертається до публічного вкладеного типу через кваліфіковане ім'я: `Outer.Inner`.

## Де це трапляється на практиці

- **Енумератори**: `List<T>.Enumerator` — публічна вкладена структура, яку повертає `GetEnumerator()`.
- **Деталі реалізації**: вузли, будівельники чи компаратори, які мають сенс лише поруч зі своїм зовнішнім класом.
- **Типи, згенеровані компілятором**: замикання (`<>c__DisplayClass`), машини станів ітераторів та async видаються як приватні вкладені класи.
- **Будівельники**: `Order.Builder`, що має привілейований доступ до конструктора `Order`.

```csharp
public class Order
{
    private readonly List<string> _items;
    private Order(List<string> items) => _items = items;

    public class Builder
    {
        private readonly List<string> _items = new();
        public Builder Add(string item) { _items.Add(item); return this; }
        public Order Build() => new Order(_items);   // може викликати приватний конструктор
    }
}

var order = new Order.Builder().Add("pen").Add("ink").Build();
```

## Коли не вкладати

Вкладення — не простір імен. Якщо тип широко використовується іншим кодом, зробіть його типом верхнього рівня: імена `Outer.Inner` незграбні в сигнатурах, а вкладені типи роздувають файл зовнішнього класу.

## Що сказати на співбесіді

- Вкладені типи бачать приватні члени та параметри узагальнення зовнішнього типу.
- Вони можуть бути `private`, і це значення за замовчуванням.
- Добре для деталей реалізації (вузли, енумератори, будівельники); погано як заміна просторів імен.
