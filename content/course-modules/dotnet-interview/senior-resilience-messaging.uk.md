## Стійкість із Polly / Microsoft.Extensions.Http.Resilience (П160)

```csharp
builder.Services.AddHttpClient<PaymentsClient>(c => c.BaseAddress = new Uri("https://payments.internal"))
    .AddResilienceHandler("payments", pipeline =>
    {
        pipeline.AddTimeout(TimeSpan.FromSeconds(10));                       // загальний бюджет
        pipeline.AddRetry(new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,                                                 // розносимо повтори в часі
        });
        pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,                                               // розмикаємо при 50% збоїв…
            MinimumThroughput = 10,                                           // …щонайменше з 10 викликів…
            SamplingDuration = TimeSpan.FromSeconds(30),                      // …у вікні 30 с
            BreakDuration = TimeSpan.FromSeconds(15),
        });
        pipeline.AddTimeout(TimeSpan.FromSeconds(2));                         // на одну спробу
    });
// або просто: .AddStandardResilienceHandler();
```

Порядок важливий: зовнішній тайм-аут обмежує все, повтори обгортають circuit breaker, внутрішній тайм-аут обмежує одну спробу. Повторюйте лише **тимчасові** помилки (5xx, 408, 429, тайм-аути, збої з'єднання) і лише **ідемпотентні** запити — або запити з ключем ідемпотентності. Поважайте `Retry-After`. Circuit breaker захищає обидві сторони: викликач швидко отримує відмову замість накопичення потоків, а викликаний сервіс отримує час відновитися. Скінченний автомат ви реалізуєте самі в практиці.

## Оркестрована сага (П159)

```csharp
public async Task<bool> PlaceOrderAsync(Order order, CancellationToken ct)
{
    var compensations = new Stack<Func<Task>>();
    try
    {
        await _inventory.ReserveAsync(order.Id, order.Lines, ct);
        compensations.Push(() => _inventory.ReleaseAsync(order.Id));

        await _payments.ChargeAsync(order.Id, order.Total, ct);
        compensations.Push(() => _payments.RefundAsync(order.Id));

        await _shipping.CreateShipmentAsync(order.Id, ct);
        return true;
    }
    catch (Exception ex)
    {
        _log.LogWarning(ex, "Order {Id} failed, compensating", order.Id);
        while (compensations.Count > 0)
        {
            try { await compensations.Pop()(); }
            catch (Exception cex) { _log.LogError(cex, "Compensation failed for {Id}", order.Id); /* відкласти для ручного виправлення */ }
        }
        return false;
    }
}
```

У продакшні стан саги має переживати падіння: зберігайте його (скінченні автомати MassTransit із репозиторієм саг, саги NServiceBus, оркестрації Durable Functions, процеси Temporal) і керуйте кроками через повідомлення, щоб перезапущений процес продовжив з місця зупинки. Компенсації мають бути ідемпотентними й можуть потребувати повторів; деякі кроки не скасуєш (лист уже надіслано) — компенсуйте семантично (надішліть виправлення).

## Семантика доставки в клієнтському коді (П162–163)

```csharp
// Azure Service Bus — at-least-once з PeekLock (за замовчуванням)
await using var processor = client.CreateProcessor("orders", new ServiceBusProcessorOptions
{
    AutoCompleteMessages = false,
    MaxConcurrentCalls = 8,
    MaxAutoLockRenewalDuration = TimeSpan.FromMinutes(5),
});
processor.ProcessMessageAsync += async args =>
{
    var id = args.Message.MessageId;
    if (await _inbox.AlreadyProcessedAsync(id)) { await args.CompleteMessageAsync(args.Message); return; }

    await using var tx = await _db.Database.BeginTransactionAsync();
    await HandleAsync(args.Message.Body.ToObjectFromJson<OrderPlaced>());
    await _inbox.MarkProcessedAsync(id);                  // у тій самій транзакції, що й бізнес-зміна
    await tx.CommitAsync();

    await args.CompleteMessageAsync(args.Message);        // підтвердження ПІСЛЯ коміту роботи
};
processor.ProcessErrorAsync += args => { _log.LogError(args.Exception, "Bus error"); return Task.CompletedTask; };
// після MaxDeliveryCount невдалих спроб повідомлення йде в dead-letter-чергу

// At-most-once: режим ReceiveAndDelete — повідомлення зникає, щойно його отримали
var receiver = client.CreateReceiver("telemetry", new ServiceBusReceiverOptions { ReceiveMode = ServiceBusReceiveMode.ReceiveAndDelete });
```

Споживачі Kafka виражають той самий вибір через те, **коли вони комітять offset**: до обробки → at-most-once; після → at-least-once; транзакції Kafka (`read_committed`, транзакційний продюсер) → exactly-once *у межах Kafka*.

## Черги й топіки в Service Bus (П168)

```csharp
await sender.SendMessageAsync(new ServiceBusMessage(json) { MessageId = cmd.Id.ToString(), SessionId = cmd.CustomerId });  // черга: один споживач
// топік "order-events" з підписками "billing", "shipping", "analytics" — кожна отримує кожну подію;
// SQL-фільтр на підписці: "Region = 'EU' AND Total > 1000"
```

## Вибір технології черг (П164)

| Потреба | Вибір |
|---|---|
| Команди й процеси в Azure, сесії/FIFO, транзакції, dead-lettering, відкладені повідомлення | Azure Service Bus |
| Потоки подій, повторне читання за offset, дуже висока пропускна здатність, багато незалежних читачів | Kafka / Azure Event Hubs |
| Власний хостинг, гнучка маршрутизація (exchange-і topic/direct/fanout), зрілість | RabbitMQ |
| Просто, дешево, величезний масштаб, at-least-once | Azure Storage Queues / Amazon SQS |
| Продюсер/споживач у межах процесу | `System.Threading.Channels` |
| Абстракція над брокерами із сагами, outbox, повторами | MassTransit, NServiceBus, Wolverine, Rebus |

## Нотатки про Azure (П165–167)

- **Service Fabric**: stateless і stateful Reliable Services, Reliable Actors, guest executables, контейнери — з партиціюванням і наборами реплік, якими керує кластер.
- Ключі **Table Storage**: проєктуйте `PartitionKey` для рівномірного навантаження та під потрібні запити (точкові запити за PartitionKey+RowKey найшвидші), використовуйте інвертовані часові мітки в `RowKey` для «найновіших першими» і дублюйте сутності під іншими ключами, коли потрібен інший шаблон доступу.
- **Холодні старти**: Premium / Flex Consumption з постійно готовими екземплярами, Dedicated-план з Always On, малі пакети розгортання, ReadyToRun, лінива ініціалізація важких клієнтів (але перевикористання статичних клієнтів між викликами).
