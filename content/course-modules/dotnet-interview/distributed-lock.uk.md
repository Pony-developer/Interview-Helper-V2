## Завдання

Питання 156: «Яку базу ви використали б для розподіленого блокування? Опишіть реалізацію.» Реалізуйте рецепт для Redis на невеликій підробці в пам'яті, разом із частиною, яку пропускає більшість відповідей: **fencing-токенами**.

`FakeRedis` дає `SetIfAbsent` (Redis `SET key value NX PX ttl`), `DeleteIfEquals` (Lua-скрипт «порівняти й видалити») і `Increment` (`INCR`). Допишіть:

1. **`DistributedLock.TryAcquire(resource, ttl)`** — згенеруйте унікальний токен (`Guid.NewGuid()`), спробуйте `SetIfAbsent("lock:" + resource, token, ttl)`. У разі невдачі поверніть `null`. У разі успіху візьміть fencing-номер через `Increment("fence:" + resource)` і поверніть `LockHandle` з ресурсом, токеном і номером. (Номер беріть лише після захоплення, щоб невдалі спроби не витрачали номери.)
2. **`DistributedLock.Release(handle)`** — видаліть ключ, лише якщо він досі містить **токен цього handle**. Просте видалення прибрало б чуже блокування, якщо ваше вже спливло.
3. **`Storage.Write(fence, data)`** — відхиліть запис, чий номер менший за найбільший уже бачений (`"rejected (stale fence N)"`); інакше запам'ятайте номер, збережіть дані й поверніть `"ok"`.

Сценарій: A бере блокування, а потім «засинає» (скажімо, довгий GC) довше за TTL. Блокування спливає, B бере його з номером 2 і пише. Коли A прокидається, він досі вважає, що тримає блокування, — сам TTL не зупинить його запис; це робить fencing-перевірка у сховищі.

Очікуваний вивід:

```
A acquired, fence 1
B: busy
B acquired, fence 2
write by B: ok
write by A: rejected (stale fence 1)
release by A: False
release by B: True
C acquired, fence 3, data B
other resource: fence 1
```
