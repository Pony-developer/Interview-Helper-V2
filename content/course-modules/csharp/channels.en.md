`BlockingCollection` makes a waiting consumer **block a thread**. In a server with hundreds of queues, blocked threads are a waste. `System.Threading.Channels` solves the same producer/consumer problem with `await`: a waiting reader or writer occupies no thread.

## A channel has two ends

```csharp
Channel<Order> channel = Channel.CreateBounded<Order>(capacity: 100);

ChannelWriter<Order> writer = channel.Writer;   // given to producers
ChannelReader<Order> reader = channel.Reader;   // given to consumers
```

Producer:

```csharp
foreach (Order order in incoming)
{
    await writer.WriteAsync(order);   // waits (without a thread) while the channel is full
}
writer.Complete();                    // "no more items": readers finish after draining the rest
```

Consumer:

```csharp
await foreach (Order order in reader.ReadAllAsync())   // ends after Complete and an empty channel
{
    await ProcessAsync(order);
}
```

Several consumers can read from one channel at the same time: each item goes to exactly one of them.

## Bounded or unbounded

- `Channel.CreateUnbounded<T>()` never makes the writer wait. If the producer is faster than the consumers, memory grows without limit.
- `Channel.CreateBounded<T>(capacity)` makes the writer wait when the channel is full. This is **backpressure**: a slow consumer automatically slows the producer down. The option `FullMode` can instead drop the oldest or the newest item, which suits telemetry where losing a sample is fine.

Prefer bounded channels in production code.

## A typical use: a background queue

In ASP.NET Core, a request should answer quickly, while slow work (sending emails, resizing images) happens later. The request writes a job into a channel and returns; a background service (`BackgroundService`) reads the channel and does the work.

```csharp
public class EmailQueue
{
    private readonly Channel<Email> channel = Channel.CreateBounded<Email>(1000);
    public ValueTask EnqueueAsync(Email email) => channel.Writer.WriteAsync(email);
    public IAsyncEnumerable<Email> ReadAllAsync(CancellationToken ct) => channel.Reader.ReadAllAsync(ct);
}
```

## Compared with other tools

| Tool | While waiting |
|---|---|
| `BlockingCollection<T>` | blocks a thread |
| `Channel<T>` | `await`, no thread |
| `ConcurrentQueue<T>` | does not wait at all: `TryDequeue` just returns `false` |

Channels are part of .NET Core 3.0 and later. They are not available in the C# 7 compiler of this course's practices, so the practice in this module uses `BlockingCollection`, which follows the same producer/consumer idea.

## The rule

For asynchronous producer/consumer pipelines, use a bounded `Channel<T>`: writers call `WriteAsync` and then `Complete`, readers use `await foreach` over `ReadAllAsync`.
