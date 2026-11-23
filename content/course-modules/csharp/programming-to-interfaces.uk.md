Найкорисніше правило абстракції коротке: **залежте від контракту, а не від реалізації**. У коді це означає, що **типи** ваших змінних, параметрів і значень, що повертаються, — це **інтерфейси** (або абстрактні класи), а конкретний клас з'являється лише там, де об'єкт **створюють**.

## Приклад: сервіс і журнал

```csharp
interface ILogger
{
    void Log(string message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message) { Console.WriteLine(message); }
}

class OrderService
{
    private readonly ILogger logger;                       // тип — інтерфейс

    public OrderService(ILogger logger)                    // журнал надається ззовні
    {
        this.logger = logger;
    }

    public void Place(int id)
    {
        // ...справжня робота...
        logger.Log("Order " + id + " placed");
    }
}

var service = new OrderService(new ConsoleLogger());       // конкретний клас вибирають в ОДНОМУ місці
service.Place(1);
```

`OrderService` нічого не знає про консоль. Завтра ви захочете писати повідомлення у файл, базу даних чи в інтернет:

```csharp
var service = new OrderService(new FileLogger("log.txt")); // змінюється один рядок, а OrderService — ні
```

Ця ідея (**давати** об'єкту те, від чого він залежить, через конструктор, а не дозволяти йому створювати залежність самому) називається **ін'єкцією залежностей**. Для неї не потрібен фреймворк. Достатньо параметрів конструктора.

## Тестова заміна

Найбільша практична користь — **тестування**. Справжній журнал пише у файл чи на екран, що важко перевірити. Замініть його простим, який **запам'ятовує** повідомлення:

```csharp
class ListLogger : ILogger
{
    private readonly List<string> messages = new List<string>();

    public void Log(string message) { messages.Add(message); }
    public string[] Messages => messages.ToArray();
}

var fake = new ListLogger();
new OrderService(fake).Place(7);
Console.WriteLine(fake.Messages[0]);                       // Order 7 placed: тест може це перевірити
```

Код `OrderService` в обох випадках той самий. Клас, що створює власні залежності (`new ConsoleLogger()` всередині), так протестувати не можна.

## Параметри: просіть найменше, що потрібно

```csharp
static double Average(List<int> numbers)                   // змушує давати List: масив не підходить
static double Average(IEnumerable<int> numbers)            // підходить будь-яка послідовність: список, масив...
```

Параметр **загального** типу робить метод корисним у **більшій кількості місць** і обіцяє менше. Тип значення, що повертається, має бути протилежним: **достатньо точним**, щоб бути корисним (наприклад, `List<string>`, якщо той, хто викликає, може додавати елементи), але не більше, ніж ви хочете обіцяти.

## Побудова з малих частин: обгортки

Клас може реалізувати інтерфейс **і використовувати інший об'єкт того самого інтерфейсу**. Це дає **обгортку** (декоратор), що щось додає:

```csharp
class PrefixLogger : ILogger
{
    private readonly ILogger inner;
    private readonly string prefix;

    public PrefixLogger(ILogger inner, string prefix) { this.inner = inner; this.prefix = prefix; }

    public void Log(string message) { inner.Log(prefix + message); }     // додає префікс і передає далі
}

var logger = new PrefixLogger(new ConsoleLogger(), "[orders] ");
new OrderService(logger).Place(2);                                        // [orders] Order 2 placed
```

`OrderService` і далі бачить лише `ILogger`. Обгортки можна вкладати одну в одну, як коробки, і кожна додає одну малу можливість. Такий ланцюжок ви побудуєте в практичній задачі.

## Коли це надмірно

Не створюйте інтерфейс для **кожного** класу «про всяк випадок». Інтерфейс вартий зусиль, коли:

- є (або скоро буде) **кілька** реалізацій;
- потрібно **замінювати** частину в тестах;
- частина на **межі** системи (файли, мережа, час, випадковість).

Малий допоміжний клас, що може мати лише одну версію, може лишатися класом.
