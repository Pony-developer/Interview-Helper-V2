## Сестра, дружня до купи

`Span<T>` не може жити в полях чи пережити `await`. `Memory<T>` (і `ReadOnlyMemory<T>`) подає ту саму ідею — зріз неперервної пам'яті — але як **звичайна структура**, що може бути будь-де:

```csharp
public class MessageBuffer
{
    private readonly Memory<byte> _payload;                 // дозволено в полі
    public MessageBuffer(byte[] data, int offset, int length) => _payload = data.AsMemory(offset, length);

    public async Task SendAsync(Stream stream, CancellationToken ct)
    {
        await stream.WriteAsync(_payload, ct);             // асинхронні API приймають Memory<T>/ReadOnlyMemory<T>
    }

    public int Checksum()
    {
        Span<byte> span = _payload.Span;                   // отримати Span для швидкої синхронної роботи
        int sum = 0;
        foreach (byte b in span) sum += b;
        return sum;
    }
}
```

Патерн: **зберігайте й передавайте** `Memory<T>`; **обробляйте** через `.Span` у синхронному коді.

`Memory<T>` не може вказувати на стекову пам'ять (саме тому він може жити в купі): він обгортає масиви, рядки (`ReadOnlyMemory<char>`) або пам'ять, якою володіє `MemoryManager<T>` (нативні буфери, блоки з пулу).

## Володіння через IMemoryOwner

Хто повертає буфер із пулу? `IMemoryOwner<T>` робить володіння явним: хто тримає власника, той і звільняє.

```csharp
using IMemoryOwner<byte> owner = MemoryPool<byte>.Shared.Rent(4096);
Memory<byte> buffer = owner.Memory;                  // може бути більшим, ніж просили
int read = await stream.ReadAsync(buffer, ct);
Process(buffer.Span[..read]);
// звільнення власника повертає буфер у пул
```

## Span чи Memory: вибір

| Потреба | Що брати |
| --- | --- |
| параметр-буфер синхронного методу | `Span<T>` / `ReadOnlySpan<T>` |
| параметр `async`-методу | `Memory<T>` / `ReadOnlyMemory<T>` |
| поле, елемент колекції, захоплення в лямбді | `Memory<T>` |
| робота зі стековою пам'яттю | `Span<T>` |

`Memory<T>.Span` має невелику вартість (перевіряє, яку пам'ять обгортає), тож отримуйте span раз на операцію, а не на кожен елемент.

## ArraySegment<T>

Старіший тип ще до спанів для «частини масиву»: масив + зсув + кількість. Він неявно перетворюється на `Span<T>`/`Memory<T>` і досі трапляється в старших API (сокети, `MemoryStream.TryGetBuffer`).

## System.IO.Pipelines і ReadOnlySequence

Для даних, що надходять кількома шматками (мережеві читання), `System.IO.Pipelines` дає `ReadOnlySequence<T>`: зв'язаний список сегментів `ReadOnlyMemory<T>`. `SequenceReader<T>` дозволяє розбирати через межі сегментів. Так Kestrel розбирає HTTP без копіювання байтів запиту.

## Що сказати на співбесіді

- `Memory<T>` — версія `Span<T>`, яку можна зберігати й використовувати з await; для обробки викликайте `.Span`.
- Асинхронні API (`Stream.ReadAsync`, сокети, канали) приймають `Memory<T>`/`ReadOnlyMemory<T>`.
- `IMemoryOwner<T>` + `MemoryPool<T>` роблять володіння буферами з пулу явним.
