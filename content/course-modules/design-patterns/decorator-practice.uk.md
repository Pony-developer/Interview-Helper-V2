Напишіть два **декоратори** для повільного сервісу погоди.

`WeatherApi` — «справжній» сервіс: кожен виклик повільний і друкує `  [weather api] <місто>`, а ще він рахує свої виклики. Обидва декоратори реалізують той самий інтерфейс `IWeather` і тримають наступний `IWeather` у полі `inner`. `Main` нашаровує їх так:

```csharp
IWeather weather = new LoggingWeather(new CachingWeather(api));
```

Реалізуйте `GetTemperature` в обох:

- **`CachingWeather`**: якщо місто є в `cache`, поверніть збережене значення, **не** викликаючи `inner`. Інакше викличте `inner`, збережіть результат у `cache` і поверніть його.
- **`LoggingWeather`**: надрукуйте `Request: <місто>`, отримайте значення від `inner`, надрукуйте `<місто> = <значення>` і поверніть значення.

Не змінюйте `Main` і `WeatherApi`. Очікуваний вивід:

```text
Request: Kyiv
  [weather api] Kyiv
Kyiv = 3
Request: Lviv
  [weather api] Lviv
Lviv = 1
Request: Kyiv
Kyiv = 3
Request: Kyiv
Kyiv = 3
Request: Lviv
Lviv = 1
Weather API calls: 2
```

П'ять запитів, але лише два справжні виклики API: логер (зовнішній шар) бачить кожен запит, а кеш (внутрішній шар) зупиняє повторні ще до API. Подумайте, що змінилося б у виводі, якби `Main` нашарував їх навпаки.

Підказка: `cache.TryGetValue(city, out value)` одним викликом каже, чи є значення в кеші, і віддає його.
