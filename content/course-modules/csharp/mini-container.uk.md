Напишіть крихітний DI-контейнер, щоб побачити, що `ServiceCollection` робить усередині. `Container` має три методи:

- `AddTransient<T>(Func<Container, T> factory)`: запам'ятовує фабрику; кожен `Resolve<T>()` викликає її і повертає **новий** об'єкт;
- `AddSingleton<T>(Func<Container, T> factory)`: запам'ятовує фабрику; **перший** `Resolve<T>()` викликає її, а кожен наступний повертає **той самий** об'єкт;
- `Resolve<T>()`: створює або повертає об'єкт для `T`. Якщо `T` ніколи не реєстрували, він кидає `InvalidOperationException` з повідомленням `No registration for <назва T>` (скористайтеся `typeof(T).Name`).

Фабрика отримує сам контейнер, тож може розв'язувати власні залежності: `c => new Greeter(c.Resolve<IClock>())`.

`Main` і сервіси не змінюйте. Очікуваний вивід:

```text
Good morning, Ann
Same greeter: False
Same clock: True
Clocks created: 1
No registration for ILogger
```

Годинник — синглтон, тож його створено один раз, хоча його просили два привітальники та два прямі виклики.

Підказка: тримайте `Dictionary<Type, Func<Container, object>>` фабрик, `HashSet<Type>` типів, зареєстрованих як синглтони, і `Dictionary<Type, object>` уже створених синглтонів. `Func<Container, T>` можна зберегти як `c => factory(c)`.
