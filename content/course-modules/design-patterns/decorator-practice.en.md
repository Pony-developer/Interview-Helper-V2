Write two **decorators** for a slow weather service.

`WeatherApi` is the "real" service: every call is slow and prints `  [weather api] <city>`, and it counts its calls. Both decorators implement the same `IWeather` interface and hold the next `IWeather` in the `inner` field. `Main` stacks them like this:

```csharp
IWeather weather = new LoggingWeather(new CachingWeather(api));
```

Implement `GetTemperature` in both:

- **`CachingWeather`**: if the city is in `cache`, return the saved value **without** calling `inner`. Otherwise call `inner`, save the result in `cache` and return it.
- **`LoggingWeather`**: print `Request: <city>`, get the value from `inner`, print `<city> = <value>` and return the value.

Do not change `Main` or `WeatherApi`. Expected output:

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

Five requests, but only two real API calls: the logger (outer layer) sees every request, while the cache (inner layer) stops the repeated ones before they reach the API. Think about what would change in the output if `Main` stacked them the other way round.

Hint: `cache.TryGetValue(city, out value)` tells you in one call whether the value is cached and gives it to you.
