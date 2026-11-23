Стандартний `Queue<T>` готовий, але корисно побачити, як побудована черга. Найпростіша — на **зв'язних списках**: кожен елемент — це вузол, що тримає значення і посилання на наступний вузол.

```csharp
class Node<T>
{
    public T Value;
    public Node<T> Next;

    public Node(T value)
    {
        Value = value;
    }
}
```

Черга тримає два посилання: `head` (початок, звідки елементи виходять) і `tail` (кінець, куди вони приходять). Обидві операції тоді займають однаковий час, незалежно від кількості елементів:

```csharp
class LinkedQueue<T>
{
    private Node<T> head;
    private Node<T> tail;
    private int count;

    public int Count { get { return count; } }

    public void Enqueue(T item)
    {
        var node = new Node<T>(item);
        if (tail == null)
        {
            head = node;                 // черга була порожньою
        }
        else
        {
            tail.Next = node;            // прив'язуємо новий вузол після останнього
        }
        tail = node;
        count++;
    }

    public T Dequeue()
    {
        if (head == null)
        {
            throw new InvalidOperationException("The queue is empty");
        }
        T value = head.Value;
        head = head.Next;
        if (head == null)
        {
            tail = null;                 // пішов останній елемент
        }
        count--;
        return value;
    }
}
```

## Чому це швидко

Додавання в кінець і видалення з початку торкаються **фіксованої кількості посилань**. Черга на масиві, що зсуває всі елементи при кожному видаленні, витратила б час, пропорційний розміру. Тому стандартний `Queue<T>` і черга на зв'язному списку працюють за O(1) на операцію.

## Дві деталі, що породжують помилки

- Коли черга стає порожньою, **і** `head`, і `tail` мають стати `null`. Інакше наступний `Enqueue` прив'яже вузол до старого.
- У `Enqueue` порожній випадок особливий: `head` теж треба задати, бо немає попереднього вузла, до якого можна прив'язати.
