A kitchen receives orders and several cooks prepare them. Write `RunKitchen(int[] orders, int cooks)` as a producer/consumer pipeline:

- create a `BlockingCollection<int>` with `boundedCapacity: 2`: at most two orders wait in the queue at a time;
- start `cooks` consumer tasks with `Task.Run`. Each one takes orders with `foreach (int order in queue.GetConsumingEnumerable())`, calls `Cook(order)`, and adds the dish to a `ConcurrentBag<int>`;
- the producer (the method itself) adds every order to the queue and then calls `CompleteAdding()`. Without this call the consumers would wait for new orders forever, and the program would hang;
- wait for all the cooks with `Task.WaitAll`, and return the dishes **sorted** in ascending order (the cooks finish in an unpredictable order).

Do not change `Main` or `Cook`. Expected output:

```text
10 20 30 40 50 60 70 80
Dishes: 8
```

Hint: `GetConsumingEnumerable()` waits while the queue is empty, and ends only when the queue is empty **and** adding is completed.
