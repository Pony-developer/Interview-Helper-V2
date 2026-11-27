**Простими словами:** декоратор **обгортає об'єкт, щоб додати щось понад те**, і ззовні виглядає точнісінько як оригінал. Обгортки можна нашаровувати.

## Картинка з життя

Одягаємося взимку: ви, далі светр, далі куртка, далі шарф. Кожен шар додає тепла, але під ними все одно ви, і шари можна додавати чи знімати, не змінюючи себе.

## Проблема

Сервіс бере дані з повільного API. Хочеться логування. І кешу. І повторів при мережевих помилках. Якщо все це покласти в сервіс, вийде один величезний клас, а з успадкуванням вийде `CachingLoggingRetryingWeatherService`. Кожна комбінація потребує власного підкласу.

## На C#

```csharp
interface IWeather
{
    int GetTemperature(string city);
}

class WeatherApi : IWeather                   // справжня робота
{
    public int GetTemperature(string city) { /* повільний HTTP-виклик */ return 3; }
}

class CachingWeather : IWeather               // декоратор: той самий інтерфейс...
{
    private readonly IWeather inner;          // ...і він МІСТИТЬ інший IWeather
    private readonly Dictionary<string, int> cache = new Dictionary<string, int>();

    public CachingWeather(IWeather inner) { this.inner = inner; }

    public int GetTemperature(string city)
    {
        int value;
        if (cache.TryGetValue(city, out value)) return value;   // додаткова поведінка
        value = inner.GetTemperature(city);                     // справжню роботу делегуємо
        cache[city] = value;
        return value;
    }
}

// Нашаровуйте як завгодно
IWeather weather = new LoggingWeather(new CachingWeather(new WeatherApi()));
```

Код, що викликає, бачить лише `IWeather`. Він не знає (і йому байдуже), скільки всередині шарів.

## Де ви вже це бачите

- **Потоки:** `new GZipStream(new BufferedStream(new FileStream(...)))`: кожен шар додає стиснення чи буферизацію.
- **ASP.NET Core та HttpClient:** `DelegatingHandler` додає повтори, логування, заголовки автентифікації навколо HTTP-виклику.
- Декорування сервісів у DI (наприклад, бібліотекою Scrutor).

## Коли застосовувати, а коли ні

- **Пасує:** наскрізні додатки (логування, кеш, повтори, метрики, перевірки), які хочеться вмикати, вимикати й вільно комбінувати.
- **Обережно:** багато шарів ускладнюють налагодження, і порядок має значення (логування зовні кешу логує кожен запит, а всередині — лише промахи кешу).

## Запам'ятайте

Decorator = **той самий інтерфейс + містить внутрішній об'єкт + додає поведінку до чи після його виклику**. Це композиція замість зоопарку підкласів.
