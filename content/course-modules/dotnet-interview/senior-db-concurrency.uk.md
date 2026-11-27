## Втрачене оновлення і чотири способи його виправити (П155)

```text
T1: SELECT stock FROM products WHERE id = 7;   -- 5
T2: SELECT stock FROM products WHERE id = 7;   -- 5
T1: UPDATE products SET stock = 4 WHERE id = 7;   -- 5 - 1
T2: UPDATE products SET stock = 4 WHERE id = 7;   -- 5 - 1   → один продаж загублено
```

1. **Атомарне оновлення** — нехай «прочитати-змінити-записати» зробить база:
   ```sql
   UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock >= 1 RETURNING stock;   -- 0 рядків = розпродано
   ```
2. **Песимістичне блокування** — заблокуйте рядок, який збираєтеся змінити:
   ```sql
   BEGIN; SELECT stock FROM products WHERE id = 7 FOR UPDATE; … UPDATE …; COMMIT;
   -- SQL Server: SELECT … FROM products WITH (UPDLOCK, ROWLOCK) WHERE id = 7
   ```
3. **Оптимістична конкурентність** — виявіть конфлікт і повторіть:
   ```sql
   UPDATE products SET stock = 4, version = version + 1 WHERE id = 7 AND version = 12;   -- 0 рядків → перечитати, повторити
   ```
   EF Core: `[Timestamp] public byte[] RowVersion` (`rowversion` у SQL Server) або `[ConcurrencyCheck]` → `DbUpdateConcurrencyException`.
4. **Суворіший рівень ізоляції** (Repeatable Read / Serializable) — база перериває одну з транзакцій помилкою серіалізації; застосунок мусить повторити.

Обирайте 1, коли зміну можна виразити однією інструкцією; 3 — для редагувань користувачами з рідкими конфліктами (форми, адмінки); 2 — для коротких критичних секцій із високою конкуренцією; 4 — для складних інваріантів, що охоплюють багато рядків.

## Черга задач у реляційній базі

```sql
-- кожен воркер забирає іншу задачу; заблоковані рядки пропускаються, а не очікуються
UPDATE jobs SET status = 'running', worker = @worker, started_at = now()
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'queued'
    ORDER BY priority DESC, id
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING id, payload;
```

Аналог у SQL Server: `WITH cte AS (SELECT TOP 1 * FROM jobs WITH (ROWLOCK, UPDLOCK, READPAST) WHERE status = 'queued' ORDER BY priority DESC) UPDATE cte SET … OUTPUT inserted.*`. Додайте тайм-аут/heartbeat, щоб задачі впалих воркерів поверталися в чергу. Бібліотеки: Hangfire, Quartz.NET (зі сховищем у БД). Цей запит ви напишете в практиці.

## Взаємні блокування

```text
T1: UPDATE accounts … WHERE id = 1;   -- блокує рядок 1
T2: UPDATE accounts … WHERE id = 2;   -- блокує рядок 2
T1: UPDATE accounts … WHERE id = 2;   -- чекає на T2
T2: UPDATE accounts … WHERE id = 1;   -- чекає на T1 → deadlock; рушій «вбиває» одну (помилка 1205 / 40P01)
```

Запобігайте однаковим порядком доступу (завжди спершу менший id), короткими транзакціями без взаємодії з користувачем чи HTTP-викликів усередині, індексами, щоб оновлення блокували мало рядків (без сканів), і `UPDLOCK` під час читання рядків, які оновлюватимете. Решту обробляйте повторами (Polly, `EnableRetryOnFailure` в EF Core). Графи взаємних блокувань збирайте через Extended Events (`xml_deadlock_report`) або `log_lock_waits` у PostgreSQL.

## Розподілені блокування на практиці (П156)

```csharp
// Application lock у SQL Server, яким володіє транзакція
await using var tx = await conn.BeginTransactionAsync();
var result = await conn.ExecuteScalarAsync<int>(
    "DECLARE @r int; EXEC @r = sp_getapplock @Resource = @res, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 0; SELECT @r;",
    new { res = "invoice:42" }, tx);
if (result < 0) return;            // його тримає хтось інший
// … робота …
await tx.CommitAsync();            // звільняє блокування

// PostgreSQL: SELECT pg_try_advisory_xact_lock(hashtext('invoice:42'));

// Redis (з бібліотекою DistributedLock)
var @lock = new RedisDistributedLock("invoice:42", redis.GetDatabase());
await using var handle = await @lock.TryAcquireAsync(TimeSpan.Zero);
if (handle is null) return;
```

Що обговорити: час оренди проти часу роботи (продовжуйте оренду або тримайте роботу короткою); що буде, коли сховище блокувань перемкнеться на репліку (реплікація Redis асинхронна — новий primary може не знати про ваше блокування); **fencing-токени** для коректності; і чи потрібне блокування взагалі — часто ідемпотентна операція, унікальне обмеження чи черга з одним споживачем на партицію прибирають цю потребу.
