import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const ORDER_TYPES = (service: string) => `interface IOrderRepository
{
    void Save(string order);
    int Count { get; }
}

interface INotifier
{
    void Notify(string message);
}

class InMemoryRepository : IOrderRepository
{
    private readonly List<string> orders = new List<string>();
    public void Save(string order) { orders.Add(order); }
    public int Count { get { return orders.Count; } }
}

// Sends real e-mails (here: prints them)
class EmailNotifier : INotifier
{
    public void Notify(string message) { Console.WriteLine("EMAIL: " + message); }
}

// For tests: only remembers the messages
class FakeNotifier : INotifier
{
    public readonly List<string> Sent = new List<string>();
    public void Notify(string message) { Sent.Add(message); }
}

// Places orders: saves them and notifies the customer
class OrderService
{
${service}

    public void Place(string order)
    {
        if (string.IsNullOrWhiteSpace(order))
        {
            throw new ArgumentException("The order is empty");
        }
        repository.Save(order);
        notifier.Notify("Order placed: " + order);
    }
}`;

const ORDER_MAIN = `        // The composition root: the real objects are created and connected here
        var repository = new InMemoryRepository();
        var service = new OrderService(repository, new EmailNotifier());
        service.Place("book");
        service.Place("pen");
        Console.WriteLine("Saved: " + repository.Count);

        // What a unit test does: a fake notifier instead of real e-mails
        var fake = new FakeNotifier();
        var tested = new OrderService(new InMemoryRepository(), fake);
        tested.Place("lamp");
        Console.WriteLine("Fake got: " + string.Join("; ", fake.Sent));

        try
        {
            new OrderService(null, fake);
        }
        catch (ArgumentNullException e)
        {
            Console.WriteLine("Missing: " + e.ParamName);
        }`;

const CONTAINER_SERVICES = `interface IClock
{
    int Hour { get; }
}

class FixedClock : IClock
{
    public static int Created;
    public FixedClock() { Created++; }
    public int Hour { get { return 9; } }
}

interface IGreeter
{
    string Greet(string name);
}

class Greeter : IGreeter
{
    private readonly IClock clock;
    public Greeter(IClock clock) { this.clock = clock; }
    public string Greet(string name)
    {
        return (clock.Hour < 12 ? "Good morning, " : "Good afternoon, ") + name;
    }
}

interface ILogger
{
    void Log(string message);
}`;

const CONTAINER_MAIN = `        var container = new Container();
        container.AddSingleton<IClock>(c => new FixedClock());
        container.AddTransient<IGreeter>(c => new Greeter(c.Resolve<IClock>()));

        IGreeter first = container.Resolve<IGreeter>();
        IGreeter second = container.Resolve<IGreeter>();
        Console.WriteLine(first.Greet("Ann"));
        Console.WriteLine("Same greeter: " + ReferenceEquals(first, second));
        Console.WriteLine("Same clock: " + ReferenceEquals(container.Resolve<IClock>(), container.Resolve<IClock>()));
        Console.WriteLine("Clocks created: " + FixedClock.Created);

        try
        {
            container.Resolve<ILogger>();
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine(e.Message);
        }`;

const PIPELINE_TYPES = (body: string) => `// Stands for HttpContext
class Context
{
    public string Path;
    public int Status = 200;
}

// One step of request handling
delegate void RequestDelegate(Context context);

// Collects middleware and builds the pipeline
class PipelineBuilder
{
    private readonly List<Func<RequestDelegate, RequestDelegate>> middlewares = new List<Func<RequestDelegate, RequestDelegate>>();

${body}
}`;

const PIPELINE_MAIN = `        var builder = new PipelineBuilder();
        builder
            .Use((context, next) =>
            {
                Console.WriteLine("log: start " + context.Path);
                next();
                Console.WriteLine("log: end " + context.Path + " -> " + context.Status);
            })
            .Use((context, next) =>
            {
                if (context.Path.StartsWith("/admin"))
                {
                    context.Status = 403;
                    return;
                }
                next();
            })
            .Use((context, next) =>
            {
                try
                {
                    next();
                }
                catch (Exception e)
                {
                    context.Status = 500;
                    Console.WriteLine("error: " + e.Message);
                }
            });

        RequestDelegate app = builder.Build(context =>
        {
            if (context.Path == "/boom")
            {
                throw new InvalidOperationException("boom");
            }
            Console.WriteLine("endpoint: " + context.Path);
        });

        foreach (string path in new[] { "/home", "/admin/users", "/boom" })
        {
            app(new Context { Path = path });
        }`;

export const diAspnetModule: ModuleDef = {
  slug: "di-aspnet",
  title: { en: "Dependency injection and ASP.NET Core", uk: "Dependency injection та ASP.NET Core" },
  slides: [
    { kind: "lecture", slug: "di-principles", title: { en: "Dependency injection", uk: "Впровадження залежностей" } },
    {
      kind: "practice",
      slug: "manual-di",
      title: { en: "Practice: Composition root", uk: "Практика «Корінь композиції»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        ORDER_TYPES(`    // Write your code here: receive the dependencies through the constructor
    private readonly InMemoryRepository repository = new InMemoryRepository();
    private readonly EmailNotifier notifier = new EmailNotifier();`),
        ORDER_MAIN,
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM_WITH(
        ORDER_TYPES(`    private readonly IOrderRepository repository;
    private readonly INotifier notifier;

    public OrderService(IOrderRepository repository, INotifier notifier)
    {
        if (repository == null)
        {
            throw new ArgumentNullException(nameof(repository));
        }
        if (notifier == null)
        {
            throw new ArgumentNullException(nameof(notifier));
        }
        this.repository = repository;
        this.notifier = notifier;
    }`),
        ORDER_MAIN,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "EMAIL: Order placed: book\nEMAIL: Order placed: pen\nSaved: 2\nFake got: Order placed: lamp\nMissing: repository\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "di-container", title: { en: "The DI container", uk: "DI-контейнер" } },
    { kind: "lecture", slug: "service-lifetimes", title: { en: "Service lifetimes", uk: "Час життя сервісів" } },
    {
      kind: "practice",
      slug: "mini-container",
      title: { en: "Practice: A tiny container", uk: "Практика «Крихітний контейнер»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        `${CONTAINER_SERVICES}

// Creates services from registered factories and keeps singletons
class Container
{
    // Write your code here: storage for the factories and the singletons

    public void AddTransient<T>(Func<Container, T> factory) where T : class
    {
        // Write your code here
    }

    public void AddSingleton<T>(Func<Container, T> factory) where T : class
    {
        // Write your code here
    }

    public T Resolve<T>() where T : class
    {
        // Write your code here
        return null;
    }
}`,
        CONTAINER_MAIN,
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM_WITH(
        `${CONTAINER_SERVICES}

// Creates services from registered factories and keeps singletons
class Container
{
    private readonly Dictionary<Type, Func<Container, object>> factories = new Dictionary<Type, Func<Container, object>>();
    private readonly HashSet<Type> singletonTypes = new HashSet<Type>();
    private readonly Dictionary<Type, object> singletons = new Dictionary<Type, object>();

    public void AddTransient<T>(Func<Container, T> factory) where T : class
    {
        factories[typeof(T)] = c => factory(c);
        singletonTypes.Remove(typeof(T));
    }

    public void AddSingleton<T>(Func<Container, T> factory) where T : class
    {
        factories[typeof(T)] = c => factory(c);
        singletonTypes.Add(typeof(T));
    }

    public T Resolve<T>() where T : class
    {
        Type type = typeof(T);
        Func<Container, object> factory;
        if (!factories.TryGetValue(type, out factory))
        {
            throw new InvalidOperationException("No registration for " + type.Name);
        }
        if (!singletonTypes.Contains(type))
        {
            return (T)factory(this);
        }
        object instance;
        if (!singletons.TryGetValue(type, out instance))
        {
            instance = factory(this);
            singletons[type] = instance;
        }
        return (T)instance;
    }
}`,
        CONTAINER_MAIN,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "Good morning, Ann\nSame greeter: False\nSame clock: True\nClocks created: 1\nNo registration for ILogger\n",
      maxScore: 10,
    },
    {
      kind: "quiz",
      slug: "di-quiz",
      title: { en: "Dependency injection", uk: "Впровадження залежностей" },
      questions: [
        {
          id: "ctor-injection",
          mode: "single",
          prompt: { en: "Why is constructor injection the default way to receive dependencies?", uk: "Чому впровадження через конструктор — спосіб отримувати залежності за замовчуванням?" },
          options: [
            { id: "a", text: { en: "The dependencies are visible in the signature, and the object is complete right after creation", uk: "Залежності видно в сигнатурі, а об'єкт повний одразу після створення" } },
            { id: "b", text: { en: "It is faster than calling methods", uk: "Це швидше, ніж виклики методів" } },
            { id: "c", text: { en: "Only constructors can receive interfaces", uk: "Лише конструктори можуть отримувати інтерфейси" } },
          ],
          correct: ["a"],
        },
        {
          id: "service-locator",
          mode: "single",
          prompt: { en: "What is wrong with calling `ServiceLocator.Get<IRepository>()` inside a class?", uk: "Що не так із викликом `ServiceLocator.Get<IRepository>()` усередині класу?" },
          options: [
            { id: "a", text: { en: "The dependency is hidden from the class's signature, and tests must configure global state", uk: "Залежність схована із сигнатури класу, а тести мусять налаштовувати глобальний стан" } },
            { id: "b", text: { en: "It does not compile", uk: "Це не компілюється" } },
            { id: "c", text: { en: "Nothing, this is the recommended pattern", uk: "Нічого, це рекомендований патерн" } },
          ],
          correct: ["a"],
        },
        {
          id: "scoped-meaning",
          mode: "single",
          prompt: { en: "How many instances of a scoped service does ASP.NET Core create?", uk: "Скільки екземплярів scoped-сервісу створює ASP.NET Core?" },
          options: [
            { id: "a", text: { en: "One per HTTP request", uk: "Один на HTTP-запит" } },
            { id: "b", text: { en: "One for the whole application", uk: "Один на весь застосунок" } },
            { id: "c", text: { en: "A new one every time it is requested", uk: "Новий щоразу, коли його просять" } },
          ],
          correct: ["a"],
        },
        {
          id: "captive",
          mode: "single",
          prompt: { en: "A singleton service takes a scoped `DbContext` in its constructor. What goes wrong?", uk: "Сервіс-синглтон отримує scoped `DbContext` у конструкторі. Що піде не так?" },
          options: [
            { id: "a", text: { en: "The first `DbContext` is captured for the whole app and shared by all requests, although it is not thread-safe", uk: "Перший `DbContext` захоплюється на весь час роботи застосунку і ділиться між усіма запитами, хоча він не потокобезпечний" } },
            { id: "b", text: { en: "Each request gets a new singleton", uk: "Кожен запит отримує новий синглтон" } },
            { id: "c", text: { en: "Nothing: lifetimes do not interact", uk: "Нічого: часи життя не взаємодіють" } },
          ],
          correct: ["a"],
        },
        {
          id: "background-db",
          mode: "single",
          prompt: { en: "How should a `BackgroundService` use a scoped `DbContext`?", uk: "Як `BackgroundService` має використовувати scoped `DbContext`?" },
          options: [
            { id: "a", text: { en: "Inject `IServiceScopeFactory`, create a scope for each unit of work, and resolve the context from it", uk: "Отримати `IServiceScopeFactory`, створювати область для кожної одиниці роботи і розв'язувати контекст з неї" } },
            { id: "b", text: { en: "Take the `DbContext` in the constructor", uk: "Отримати `DbContext` у конструкторі" } },
            { id: "c", text: { en: "Register `DbContext` as a singleton", uk: "Зареєструвати `DbContext` як синглтон" } },
          ],
          correct: ["a"],
        },
        {
          id: "many-impls",
          mode: "multi",
          prompt: {
            en: "`EmailNotifier` and then `SmsNotifier` are registered for `INotifier`. Which statements are true?",
            uk: "Для `INotifier` зареєстровано спершу `EmailNotifier`, а потім `SmsNotifier`. Які твердження правильні?",
          },
          options: [
            { id: "a", text: { en: "A constructor parameter `INotifier` gets `SmsNotifier`", uk: "Параметр конструктора `INotifier` отримає `SmsNotifier`" } },
            { id: "b", text: { en: "A constructor parameter `IEnumerable<INotifier>` gets both", uk: "Параметр конструктора `IEnumerable<INotifier>` отримає обидва" } },
            { id: "c", text: { en: "The container throws because of the duplicate", uk: "Контейнер кидає виняток через дублікат" } },
            { id: "d", text: { en: "A constructor parameter `INotifier` gets `EmailNotifier`", uk: "Параметр конструктора `INotifier` отримає `EmailNotifier`" } },
          ],
          correct: ["a", "b"],
        },
      ],
    },
    { kind: "lecture", slug: "aspnet-pipeline", title: { en: "The ASP.NET Core pipeline", uk: "Конвеєр ASP.NET Core" } },
    {
      kind: "practice",
      slug: "middleware-pipeline",
      title: { en: "Practice: Middleware pipeline", uk: "Практика «Конвеєр middleware»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        PIPELINE_TYPES(`    // Remembers a middleware; returns the builder for chaining
    public PipelineBuilder Use(Action<Context, Action> middleware)
    {
        // Write your code here
        return this;
    }

    // Wraps the endpoint into all middleware; the first added is the outermost
    public RequestDelegate Build(RequestDelegate endpoint)
    {
        // Write your code here
        return endpoint;
    }`),
        PIPELINE_MAIN,
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM_WITH(
        PIPELINE_TYPES(`    // Remembers a middleware; returns the builder for chaining
    public PipelineBuilder Use(Action<Context, Action> middleware)
    {
        middlewares.Add(next => context => middleware(context, () => next(context)));
        return this;
    }

    // Wraps the endpoint into all middleware; the first added is the outermost
    public RequestDelegate Build(RequestDelegate endpoint)
    {
        RequestDelegate app = endpoint;
        for (int i = middlewares.Count - 1; i >= 0; i--)
        {
            app = middlewares[i](app);
        }
        return app;
    }`),
        PIPELINE_MAIN,
        "using System.Collections.Generic;",
      ),
      expectedOutput:
        "log: start /home\nendpoint: /home\nlog: end /home -> 200\nlog: start /admin/users\nlog: end /admin/users -> 403\nlog: start /boom\nerror: boom\nlog: end /boom -> 500\n",
      maxScore: 10,
    },
    { kind: "lecture", slug: "aspnet-endpoints", title: { en: "Endpoints: minimal APIs and controllers", uk: "Кінцеві точки: minimal API і контролери" } },
    {
      kind: "quiz",
      slug: "aspnet-quiz",
      title: { en: "Pipeline and endpoints", uk: "Конвеєр і кінцеві точки" },
      questions: [
        {
          id: "short-circuit",
          mode: "single",
          prompt: { en: "What happens when a middleware does not call `next`?", uk: "Що станеться, коли middleware не викликає `next`?" },
          options: [
            { id: "a", text: { en: "The request does not go further: this middleware produces the response itself", uk: "Запит далі не йде: цей middleware сам формує відповідь" } },
            { id: "b", text: { en: "The framework calls `next` automatically", uk: "Фреймворк викликає `next` автоматично" } },
            { id: "c", text: { en: "The application crashes", uk: "Застосунок падає" } },
          ],
          correct: ["a"],
        },
        {
          id: "auth-order",
          mode: "single",
          prompt: { en: "Why must `UseAuthentication()` come before `UseAuthorization()`?", uk: "Чому `UseAuthentication()` має стояти перед `UseAuthorization()`?" },
          options: [
            { id: "a", text: { en: "Authorization needs to know who the user is, which authentication determines", uk: "Авторизації треба знати, хто користувач, а це визначає автентифікація" } },
            { id: "b", text: { en: "The order does not matter", uk: "Порядок не важливий" } },
            { id: "c", text: { en: "Authorization is slower", uk: "Авторизація повільніша" } },
          ],
          correct: ["a"],
        },
        {
          id: "middleware-scoped",
          mode: "single",
          prompt: { en: "A middleware class needs a scoped service. Where should it receive it?", uk: "Класу middleware потрібен scoped-сервіс. Де він має його отримати?" },
          options: [
            { id: "a", text: { en: "As a parameter of `InvokeAsync`: the middleware object itself lives for the whole app", uk: "Як параметр `InvokeAsync`: сам об'єкт middleware живе весь час роботи застосунку" } },
            { id: "b", text: { en: "In the constructor", uk: "У конструкторі" } },
            { id: "c", text: { en: "From a static field", uk: "Зі статичного поля" } },
          ],
          correct: ["a"],
        },
        {
          id: "api-controller",
          mode: "single",
          prompt: { en: "With `[ApiController]`, what happens when the request body fails `[Required]` validation?", uk: "Що відбувається з `[ApiController]`, коли тіло запиту не проходить валідацію `[Required]`?" },
          options: [
            { id: "a", text: { en: "The framework answers 400 with ProblemDetails before the action runs", uk: "Фреймворк відповідає 400 з ProblemDetails ще до виконання дії" } },
            { id: "b", text: { en: "The action runs with `null` values", uk: "Дія виконується зі значеннями `null`" } },
            { id: "c", text: { en: "The server returns 500", uk: "Сервер повертає 500" } },
          ],
          correct: ["a"],
        },
        {
          id: "401-403",
          mode: "single",
          prompt: { en: "What is the difference between 401 and 403?", uk: "Яка різниця між 401 і 403?" },
          options: [
            { id: "a", text: { en: "401: the user is not authenticated; 403: the user is known but not allowed", uk: "401: користувача не автентифіковано; 403: користувач відомий, але йому не дозволено" } },
            { id: "b", text: { en: "401: not found; 403: server error", uk: "401: не знайдено; 403: помилка сервера" } },
            { id: "c", text: { en: "They mean the same", uk: "Вони означають те саме" } },
          ],
          correct: ["a"],
        },
        {
          id: "created",
          mode: "single",
          prompt: { en: "Which response fits a `POST` that created a new resource?", uk: "Яка відповідь пасує до `POST`, що створив новий ресурс?" },
          options: [
            { id: "a", text: { en: "201 Created, with a `Location` header pointing to the new resource", uk: "201 Created із заголовком `Location`, що вказує на новий ресурс" } },
            { id: "b", text: { en: "204 No Content", uk: "204 No Content" } },
            { id: "c", text: { en: "302 Found", uk: "302 Found" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "aspnet-configuration", title: { en: "Configuration and options", uk: "Конфігурація та налаштування" } },
    { kind: "lecture", slug: "aspnet-essentials", title: { en: "Logging, errors and background work", uk: "Логування, помилки та фонова робота" } },
    {
      kind: "quiz",
      slug: "di-aspnet-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "config-override",
          mode: "single",
          prompt: { en: "`appsettings.json` has `Smtp:Host = localhost`, and the environment variable `Smtp__Host` is `mail.example.com`. Which value does the app see?", uk: "В `appsettings.json` є `Smtp:Host = localhost`, а змінна середовища `Smtp__Host` дорівнює `mail.example.com`. Яке значення побачить застосунок?" },
          options: [
            { id: "a", text: { en: "`mail.example.com`: environment variables override the JSON files", uk: "`mail.example.com`: змінні середовища перекривають JSON-файли" } },
            { id: "b", text: { en: "`localhost`: the file always wins", uk: "`localhost`: файл завжди перемагає" } },
            { id: "c", text: { en: "An error about a conflict", uk: "Помилку про конфлікт" } },
          ],
          correct: ["a"],
        },
        {
          id: "options-snapshot",
          mode: "single",
          prompt: { en: "Which interface gives options that are re-read for every request after the file changes?", uk: "Який інтерфейс дає налаштування, що перечитуються для кожного запиту після зміни файлу?" },
          options: [
            { id: "a", text: { en: "`IOptionsSnapshot<T>`", uk: "`IOptionsSnapshot<T>`" } },
            { id: "b", text: { en: "`IOptions<T>`", uk: "`IOptions<T>`" } },
            { id: "c", text: { en: "`IConfiguration` only", uk: "Лише `IConfiguration`" } },
          ],
          correct: ["a"],
        },
        {
          id: "log-template",
          mode: "single",
          prompt: {
            en: "Why write `logger.LogInformation(\"Order {Id} placed\", id)` instead of `logger.LogInformation($\"Order {id} placed\")`?",
            uk: "Чому писати `logger.LogInformation(\"Order {Id} placed\", id)`, а не `logger.LogInformation($\"Order {id} placed\")`?",
          },
          options: [
            { id: "a", text: { en: "The template keeps `Id` as a separate searchable field, and the string is not built when the level is off", uk: "Шаблон зберігає `Id` як окреме поле для пошуку, а рядок не будується, коли рівень вимкнено" } },
            { id: "b", text: { en: "Interpolated strings are not allowed in logs", uk: "Інтерпольовані рядки в логах заборонені" } },
            { id: "c", text: { en: "There is no difference", uk: "Різниці немає" } },
          ],
          correct: ["a"],
        },
        {
          id: "secrets",
          mode: "multi",
          prompt: { en: "Where may a database password be kept?", uk: "Де можна зберігати пароль до бази даних?" },
          options: [
            { id: "a", text: { en: "In user secrets on a developer's machine", uk: "У секретах користувача на машині розробника" } },
            { id: "b", text: { en: "In an environment variable or a secret store in production", uk: "У змінній середовища або сховищі секретів у продакшені" } },
            { id: "c", text: { en: "In `appsettings.json` committed to the repository", uk: "В `appsettings.json`, закоміченому в репозиторій" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "http-client-factory",
          mode: "single",
          prompt: { en: "Why use `IHttpClientFactory` instead of `new HttpClient()` for each call?", uk: "Навіщо `IHttpClientFactory` замість `new HttpClient()` на кожен виклик?" },
          options: [
            { id: "a", text: { en: "It reuses connections correctly, avoids socket exhaustion, and centralizes retries and timeouts", uk: "Вона правильно повторно використовує з'єднання, уникає вичерпання сокетів і збирає повтори й таймаути в одному місці" } },
            { id: "b", text: { en: "`HttpClient` cannot be created directly", uk: "`HttpClient` не можна створити напряму" } },
            { id: "c", text: { en: "It makes requests synchronous", uk: "Вона робить запити синхронними" } },
          ],
          correct: ["a"],
        },
        {
          id: "exception-handler-first",
          mode: "single",
          prompt: { en: "Why is `UseExceptionHandler` added at the very beginning of the pipeline?", uk: "Чому `UseExceptionHandler` додають на самому початку конвеєра?" },
          options: [
            { id: "a", text: { en: "A middleware catches only exceptions from what comes after it, so the first one sees everything", uk: "Middleware перехоплює лише винятки з того, що йде після нього, тож перший бачить усе" } },
            { id: "b", text: { en: "It must run before the services are registered", uk: "Він має виконатися до реєстрації сервісів" } },
            { id: "c", text: { en: "The position does not matter", uk: "Позиція не важлива" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
