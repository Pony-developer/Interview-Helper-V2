**Ковзне середнє** останніх `k` значень — класичне застосування черги. Нові значення приходять у кінець, а найстаріше виходить з початку, тож вікно завжди тримає останні `k` значень.

Перераховувати суму всього вікна щоразу повільно. Натомість тримайте поточну суму й оновлюйте її: додайте нове значення і віднімайте те, що виходить.

```csharp
class MovingAverage
{
    private readonly Queue<double> window = new Queue<double>();
    private readonly int size;
    private double sum;

    public MovingAverage(int size)
    {
        this.size = size;
    }

    public double Add(double value)
    {
        window.Enqueue(value);
        sum += value;
        if (window.Count > size)
        {
            sum -= window.Dequeue();      // найстаріше значення виходить з вікна
        }
        return sum / window.Count;
    }
}

var avg = new MovingAverage(3);
Console.WriteLine(avg.Add(10));        // 10: вікно [10]
Console.WriteLine(avg.Add(20));        // 15: вікно [10, 20]
Console.WriteLine(avg.Add(30));        // 20: вікно [10, 20, 30]
Console.WriteLine(avg.Add(40));        // 30: вікно [20, 30, 40]
```

## Черга тут пасує точно

Значення мають виходити в **тому самому порядку**, в якому прийшли, тож найстаріше завжди першим іде геть. Це правило FIFO. Стек відкинув би найновіше значення, а це неправильне.

## Кожен крок коштує однаково

Додавання й видалення в черзі — O(1), а сума оновлюється одним додаванням і одним відніманням. Потік із мільйона значень коштує мільйон малих кроків, а не мільйон, помножений на розмір вікна.
