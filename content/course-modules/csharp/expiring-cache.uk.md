`ExpiringCache` зберігає кожне значення протягом `ttl` (time to live, час життя) після того, як його записали. Він уже приймає `IClock` у конструкторі, але ігнорує його і читає `DateTime.UtcNow`, тож тести в `Main` не можуть перевірити закінчення терміну, не чекаючи справжніх п'ять хвилин. Зробіть кеш тестованим:

1. Допишіть `FakeClock`: конструктор задає початковий час, `UtcNow` повертає поточний фейковий час, а `Advance(time)` посуває його вперед. Сам собою фейковий годинник ніколи не рухається.
2. Зробіть так, щоб `ExpiringCache` читав час лише з `clock`, ніколи не з `DateTime`.
3. Напишіть `RemoveExpired()`: він видаляє кожен прострочений запис і повертає, скільки видалив.

Запис, збережений у момент `T`, знаходиться, доки час менший за `T + ttl`; у момент `T + ttl` він уже прострочений. Повторний запис ключа зберігає нове значення і перезапускає його таймер.

Кожна перевірка в `Main` створює власні годинник і кеш, тож перевірки не залежать одна від одної. Не змінюйте `Main` і `Check`. Очікуваний вивід:

```text
ok: the fake clock shows the start time
ok: Advance moves the fake clock
ok: a fresh value is found
ok: a missing key is not found
ok: a value is still there after 4:59
ok: a value is gone after exactly 5 minutes
ok: Set again restarts the timer
ok: RemoveExpired removes only the expired entries
```

Підказка: не можна видаляти записи з `Dictionary`, поки його перебирає `foreach`. Спершу зберіть прострочені ключі в список, а потім видаліть їх.
