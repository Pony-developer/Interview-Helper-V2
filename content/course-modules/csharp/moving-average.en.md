A **moving average** of the last `k` values is a classic use of a queue. New values arrive at the back, and the oldest one leaves the front, so the window always holds the latest `k` values.

Recomputing the sum over the whole window each time is slow. Instead, keep the running sum and update it: add the new value, and subtract the one that leaves.

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
            sum -= window.Dequeue();      // the oldest value leaves the window
        }
        return sum / window.Count;
    }
}

var avg = new MovingAverage(3);
Console.WriteLine(avg.Add(10));        // 10: window [10]
Console.WriteLine(avg.Add(20));        // 15: window [10, 20]
Console.WriteLine(avg.Add(30));        // 20: window [10, 20, 30]
Console.WriteLine(avg.Add(40));        // 30: window [20, 30, 40]
```

## The queue fits exactly

The values must leave in the **same order** they arrived, so the oldest is always the first to go. That is the FIFO rule. A stack would throw away the newest value instead, which is the wrong one.

## Each step costs the same

Adding and removing from a queue are O(1), and the sum is updated with one addition and one subtraction. A stream of a million values costs a million small steps, not a million times the window size.
