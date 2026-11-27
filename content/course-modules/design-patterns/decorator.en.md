**In plain words:** a decorator **wraps an object to add something extra**, while looking exactly like the original from the outside. Wrappers can be stacked like layers.

## A picture from life

Dressing for winter: you, then a sweater, then a jacket, then a scarf. Each layer adds warmth, but it's still you underneath, and you can add or remove layers without changing who you are.

## The problem

A service fetches data from a slow API. You want logging. And caching. And retries for network errors. Putting all of it inside the service makes one huge class, and inheritance gives you `CachingLoggingRetryingWeatherService`. Every combination needs its own subclass.

## In C#

```csharp
interface IWeather
{
    int GetTemperature(string city);
}

class WeatherApi : IWeather                   // the real work
{
    public int GetTemperature(string city) { /* slow HTTP call */ return 3; }
}

class CachingWeather : IWeather               // a decorator: same interface...
{
    private readonly IWeather inner;          // ...and it HOLDS another IWeather
    private readonly Dictionary<string, int> cache = new Dictionary<string, int>();

    public CachingWeather(IWeather inner) { this.inner = inner; }

    public int GetTemperature(string city)
    {
        int value;
        if (cache.TryGetValue(city, out value)) return value;   // extra behavior
        value = inner.GetTemperature(city);                     // delegate the real work
        cache[city] = value;
        return value;
    }
}

// Stack the layers as you like
IWeather weather = new LoggingWeather(new CachingWeather(new WeatherApi()));
```

The calling code sees only `IWeather`. It doesn't know (and doesn't care) how many layers are inside.

## Where you already see it

- **Streams:** `new GZipStream(new BufferedStream(new FileStream(...)))`: each layer adds compression or buffering.
- **ASP.NET Core and HttpClient:** `DelegatingHandler` adds retries, logging, auth headers around an HTTP call.
- Decorating services in DI (for example with the Scrutor library).

## When to use it, and when not to

- **Fits:** cross-cutting extras (logging, caching, retries, metrics, validation) that you want to turn on and off and combine freely.
- **Careful:** many layers make debugging harder, and the order matters (logging outside the cache logs every request; inside it logs only cache misses).

## Remember

Decorator = **same interface + holds an inner object + adds behavior before or after calling it**. It's composition instead of a zoo of subclasses.
