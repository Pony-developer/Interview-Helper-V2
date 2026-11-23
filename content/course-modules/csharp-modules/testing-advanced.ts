import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const RUNNER_TYPES = `// --- A tiny test framework: attributes and assertions ---
[AttributeUsage(AttributeTargets.Method)]
class FactAttribute : Attribute
{
    // When set, the test is not run: it is reported as skipped, with this reason
    public string Skip { get; set; }
}

[AttributeUsage(AttributeTargets.Method)]
class TheoryAttribute : Attribute
{
}

[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
class InlineDataAttribute : Attribute
{
    public readonly object[] Data;
    public InlineDataAttribute(params object[] data) { Data = data; }
}

class AssertException : Exception
{
    public AssertException(string message) : base(message) { }
}

static class Assert
{
    public static void Equal<T>(T expected, T actual)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
        {
            throw new AssertException("expected " + expected + ", but was " + actual);
        }
    }
}

// --- The tests to run ---
class CartTests : IDisposable
{
    public static int Created;
    public static int Disposed;

    // Every test expects to start with an empty cart
    private readonly List<string> cart = new List<string>();

    public CartTests() { Created++; }

    public void Dispose() { Disposed++; }

    [Fact]
    public void AddOne_CountIsOne()
    {
        cart.Add("apple");
        Assert.Equal(1, cart.Count);
    }

    [Fact]
    public void AddTwo_CountIsTwo()
    {
        cart.Add("pear");
        cart.Add("plum");
        Assert.Equal(2, cart.Count);
    }

    [Fact]
    public void Total_IsWrong()
    {
        Assert.Equal(4, 2 + 3);
    }

    [Fact]
    public void First_OfEmptyCart()
    {
        if (cart.Count == 0)
        {
            throw new InvalidOperationException("the cart is empty");
        }
    }

    [Fact(Skip = "discounts are not ready")]
    public void Discount_IsApplied()
    {
        throw new NotImplementedException();
    }

    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(-1, 1, 0)]
    [InlineData(2, 2, 5)]
    public void Add_ReturnsSum(int a, int b, int sum)
    {
        Assert.Equal(sum, a + b);
    }

    // Not a test: it has no attribute
    public void Helper()
    {
        Console.WriteLine("Helper must not run");
    }
}`;

const RUNNER_MAIN = `        Run(typeof(CartTests));
        Console.WriteLine("Instances created: " + CartTests.Created + ", disposed: " + CartTests.Disposed);`;

const RUNNER_USINGS = "using System.Collections.Generic;\nusing System.Linq;\nusing System.Reflection;";

const RUNNER_RUN = (body: string) => `    // Finds the tests of testClass, runs each of them and prints the report
    static void Run(Type testClass)
    {
${body}
    }`;

const CACHE_TYPES = (fakeClock: string, cache: string) => `// The current time, as a dependency
interface IClock
{
    DateTime UtcNow { get; }
}

// The real clock, for production
class SystemClock : IClock
{
    public DateTime UtcNow { get { return DateTime.UtcNow; } }
}

// A clock for tests: it stands still until the test moves it
class FakeClock : IClock
{
${fakeClock}
}

// Keeps each value for \`ttl\` after it was set
class ExpiringCache
{
    private readonly IClock clock;
    private readonly TimeSpan ttl;
    private readonly Dictionary<string, string> values = new Dictionary<string, string>();
    private readonly Dictionary<string, DateTime> expiresAt = new Dictionary<string, DateTime>();

    public ExpiringCache(IClock clock, TimeSpan ttl)
    {
        this.clock = clock;
        this.ttl = ttl;
    }

    // The number of stored entries, expired or not
    public int Count { get { return values.Count; } }

${cache}
}`;

const CACHE_MAIN = `        var start = new DateTime(2025, 3, 1, 12, 0, 0, DateTimeKind.Utc);
        var ttl = TimeSpan.FromMinutes(5);

        Check("the fake clock shows the start time", () => new FakeClock(start).UtcNow == start);
        Check("Advance moves the fake clock", () =>
        {
            var clock = new FakeClock(start);
            clock.Advance(TimeSpan.FromSeconds(90));
            return clock.UtcNow == start.AddSeconds(90);
        });
        Check("a fresh value is found", () =>
        {
            var cache = new ExpiringCache(new FakeClock(start), ttl);
            cache.Set("user:1", "Ann");
            string value;
            return cache.TryGet("user:1", out value) && value == "Ann";
        });
        Check("a missing key is not found", () =>
        {
            var cache = new ExpiringCache(new FakeClock(start), ttl);
            string value;
            return !cache.TryGet("user:2", out value);
        });
        Check("a value is still there after 4:59", () =>
        {
            var clock = new FakeClock(start);
            var cache = new ExpiringCache(clock, ttl);
            cache.Set("user:1", "Ann");
            clock.Advance(new TimeSpan(0, 4, 59));
            string value;
            return cache.TryGet("user:1", out value);
        });
        Check("a value is gone after exactly 5 minutes", () =>
        {
            var clock = new FakeClock(start);
            var cache = new ExpiringCache(clock, ttl);
            cache.Set("user:1", "Ann");
            clock.Advance(ttl);
            string value;
            return !cache.TryGet("user:1", out value);
        });
        Check("Set again restarts the timer", () =>
        {
            var clock = new FakeClock(start);
            var cache = new ExpiringCache(clock, ttl);
            cache.Set("user:1", "Ann");
            clock.Advance(TimeSpan.FromMinutes(3));
            cache.Set("user:1", "Bob");
            clock.Advance(TimeSpan.FromMinutes(3));
            string value;
            return cache.TryGet("user:1", out value) && value == "Bob";
        });
        Check("RemoveExpired removes only the expired entries", () =>
        {
            var clock = new FakeClock(start);
            var cache = new ExpiringCache(clock, ttl);
            cache.Set("old", "1");
            clock.Advance(TimeSpan.FromMinutes(2));
            cache.Set("new", "2");
            clock.Advance(TimeSpan.FromMinutes(3));
            int removed = cache.RemoveExpired();
            string value;
            return removed == 1 && cache.Count == 1 && cache.TryGet("new", out value);
        });`;

const CACHE_CHECK = `    static void Check(string name, Func<bool> test)
    {
        string result;
        try
        {
            result = test() ? "ok" : "FAIL";
        }
        catch (Exception e)
        {
            result = "FAIL (" + e.GetType().Name + ")";
        }
        Console.WriteLine(result + ": " + name);
    }`;

export const testingAdvancedModule: ModuleDef = {
  slug: "testing-advanced",
  title: { en: "Testing in practice: doubles, xUnit, integration tests", uk: "Тестування на практиці: дублери, xUnit, інтеграційні тести" },
  slides: [
    { kind: "lecture", slug: "test-doubles", title: { en: "Test doubles: dummy, stub, spy, mock, fake", uk: "Тестові дублери: dummy, stub, spy, mock, fake" } },
    { kind: "lecture", slug: "mocking-libraries", title: { en: "Mocking libraries: Moq and NSubstitute", uk: "Бібліотеки для моків: Moq і NSubstitute" } },
    {
      kind: "quiz",
      slug: "test-doubles-quiz",
      title: { en: "Test doubles", uk: "Тестові дублери" },
      questions: [
        {
          id: "stub-vs-mock",
          mode: "single",
          prompt: { en: "What is the difference between a stub and a mock?", uk: "Яка різниця між стабом і моком?" },
          options: [
            { id: "a", text: { en: "A stub feeds canned answers into the code under test; a mock records calls, and the test checks that the expected calls were made", uk: "Стаб подає заготовлені відповіді в код, що тестується; мок записує виклики, і тест перевіряє, що очікувані виклики відбулися" } },
            { id: "b", text: { en: "A stub is written by hand, a mock is generated by a library; otherwise they are the same", uk: "Стаб пишуть вручну, мок генерує бібліотека; в іншому вони однакові" } },
            { id: "c", text: { en: "A mock is used in integration tests, a stub in unit tests", uk: "Мок використовують в інтеграційних тестах, стаб — у модульних" } },
          ],
          correct: ["a"],
        },
        {
          id: "fake",
          mode: "single",
          prompt: { en: "An in-memory repository that really stores and finds orders, but in a `Dictionary` instead of a database, is a…", uk: "Репозиторій у пам'яті, який справді зберігає і знаходить замовлення, але в `Dictionary` замість бази даних, — це…" },
          options: [
            { id: "a", text: { en: "Fake", uk: "Fake" } },
            { id: "b", text: { en: "Dummy", uk: "Dummy" } },
            { id: "c", text: { en: "Mock", uk: "Mock" } },
          ],
          correct: ["a"],
        },
        {
          id: "what-to-replace",
          mode: "multi",
          prompt: { en: "Which dependencies are usually worth replacing with a test double in a unit test?", uk: "Які залежності зазвичай варто замінити тестовим дублером у модульному тесті?" },
          options: [
            { id: "a", text: { en: "A payment provider's HTTP API", uk: "HTTP API платіжного провайдера" } },
            { id: "b", text: { en: "The system clock", uk: "Системний годинник" } },
            { id: "c", text: { en: "An SMTP server that sends e-mails", uk: "SMTP-сервер, що надсилає листи" } },
            { id: "d", text: { en: "A `Money` value object with no dependencies of its own", uk: "Об'єкт-значення `Money` без власних залежностей" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "moq-virtual",
          mode: "single",
          prompt: { en: "Why can Moq not set up a non-virtual method of a concrete class?", uk: "Чому Moq не може налаштувати невіртуальний метод конкретного класу?" },
          options: [
            { id: "a", text: { en: "It builds a subclass (a proxy) at run time, and a subclass can override only interface members and virtual members", uk: "Він будує підклас (проксі) під час виконання, а підклас може перевизначити лише члени інтерфейсу та віртуальні члени" } },
            { id: "b", text: { en: "Non-virtual methods are compiled to native code before the test starts", uk: "Невіртуальні методи компілюються в нативний код до старту тесту" } },
            { id: "c", text: { en: "It can, but only in Release builds", uk: "Може, але лише в Release-збірці" } },
          ],
          correct: ["a"],
        },
        {
          id: "over-mocking",
          mode: "single",
          prompt: {
            en: "A test mocks every collaborator of a service and verifies each call, its arguments and their order. What is the main risk?",
            uk: "Тест мокає всіх співпрацівників сервісу й перевіряє кожен виклик, його аргументи та порядок. Який головний ризик?",
          },
          options: [
            { id: "a", text: { en: "The test is tied to the implementation: it breaks on a harmless refactoring and may still pass when the result is wrong", uk: "Тест прив'язаний до реалізації: він ламається від безпечного рефакторингу і може проходити, коли результат неправильний" } },
            { id: "b", text: { en: "Mocks make tests slower than a real database", uk: "Моки роблять тести повільнішими за справжню базу даних" } },
            { id: "c", text: { en: "There is no risk: more verification is always better", uk: "Ризику немає: більше перевірок — завжди краще" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "xunit-in-depth", title: { en: "xUnit in depth: lifecycle, fixtures, data", uk: "xUnit глибше: життєвий цикл, фікстури, дані" } },
    {
      kind: "practice",
      slug: "mini-xunit",
      title: { en: "Practice: Your own test runner", uk: "Практика «Власний запускач тестів»" },
      language: "csharp",
      starter: PROGRAM_WITH(RUNNER_TYPES, RUNNER_MAIN, RUNNER_USINGS, RUNNER_RUN("        // Write your code here")),
      solution: PROGRAM_WITH(
        RUNNER_TYPES,
        RUNNER_MAIN,
        RUNNER_USINGS,
        `${RUNNER_RUN(`        int passed = 0, failed = 0, skipped = 0;
        foreach (MethodInfo method in testClass.GetMethods().OrderBy(m => m.Name, StringComparer.Ordinal))
        {
            var fact = method.GetCustomAttribute<FactAttribute>();
            var cases = new List<KeyValuePair<string, object[]>>();
            if (fact != null && fact.Skip != null)
            {
                Console.WriteLine("SKIP " + method.Name + ": " + fact.Skip);
                skipped++;
                continue;
            }
            if (fact != null)
            {
                cases.Add(new KeyValuePair<string, object[]>(method.Name, new object[0]));
            }
            else if (method.GetCustomAttribute<TheoryAttribute>() != null)
            {
                foreach (var data in method.GetCustomAttributes<InlineDataAttribute>())
                {
                    string name = method.Name + "(" + string.Join(", ", data.Data) + ")";
                    cases.Add(new KeyValuePair<string, object[]>(name, data.Data));
                }
                cases = cases.OrderBy(c => c.Key, StringComparer.Ordinal).ToList();
            }
            foreach (var testCase in cases)
            {
                string error = RunOne(testClass, method, testCase.Value);
                if (error == null)
                {
                    Console.WriteLine("PASS " + testCase.Key);
                    passed++;
                }
                else
                {
                    Console.WriteLine("FAIL " + testCase.Key + ": " + error);
                    failed++;
                }
            }
        }
        Console.WriteLine("Passed: " + passed + ", failed: " + failed + ", skipped: " + skipped);`)}

    // Runs one test on a new instance of the class: null if it passed, otherwise the reason it failed
    static string RunOne(Type testClass, MethodInfo method, object[] args)
    {
        object instance = Activator.CreateInstance(testClass);
        try
        {
            method.Invoke(instance, args);
            return null;
        }
        catch (TargetInvocationException e)
        {
            Exception error = e.InnerException;
            if (error is AssertException)
            {
                return error.Message;
            }
            return error.GetType().Name + ": " + error.Message;
        }
        finally
        {
            var disposable = instance as IDisposable;
            if (disposable != null)
            {
                disposable.Dispose();
            }
        }
    }`,
      ),
      expectedOutput:
        "PASS AddOne_CountIsOne\nPASS AddTwo_CountIsTwo\nPASS Add_ReturnsSum(-1, 1, 0)\nFAIL Add_ReturnsSum(2, 2, 5): expected 5, but was 4\nPASS Add_ReturnsSum(2, 3, 5)\nSKIP Discount_IsApplied: discounts are not ready\nFAIL First_OfEmptyCart: InvalidOperationException: the cart is empty\nFAIL Total_IsWrong: expected 4, but was 5\nPassed: 4, failed: 3, skipped: 1\nInstances created: 7, disposed: 7\n",
      maxScore: 10,
    },
    { kind: "lecture", slug: "testing-hard-dependencies", title: { en: "Testing time, async code and HttpClient", uk: "Тестування часу, асинхронного коду і HttpClient" } },
    {
      kind: "practice",
      slug: "expiring-cache",
      title: { en: "Practice: A cache you can test", uk: "Практика «Кеш, який можна протестувати»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        CACHE_TYPES(
          `    public FakeClock(DateTime start)
    {
        // Write your code here
    }

    public DateTime UtcNow { get { return DateTime.MinValue; } }

    public void Advance(TimeSpan time)
    {
        // Write your code here
    }`,
          `    public void Set(string key, string value)
    {
        values[key] = value;
        expiresAt[key] = DateTime.UtcNow + ttl;
    }

    // A value is found until its time is up: at the moment set time + ttl it is already gone
    public bool TryGet(string key, out string value)
    {
        if (values.ContainsKey(key) && DateTime.UtcNow < expiresAt[key])
        {
            value = values[key];
            return true;
        }
        value = null;
        return false;
    }

    // Deletes the expired entries and returns how many were deleted
    public int RemoveExpired()
    {
        // Write your code here
        return 0;
    }`,
        ),
        CACHE_MAIN,
        "using System.Collections.Generic;",
        CACHE_CHECK,
      ),
      solution: PROGRAM_WITH(
        CACHE_TYPES(
          `    private DateTime now;

    public FakeClock(DateTime start)
    {
        now = start;
    }

    public DateTime UtcNow { get { return now; } }

    public void Advance(TimeSpan time)
    {
        now += time;
    }`,
          `    public void Set(string key, string value)
    {
        values[key] = value;
        expiresAt[key] = clock.UtcNow + ttl;
    }

    // A value is found until its time is up: at the moment set time + ttl it is already gone
    public bool TryGet(string key, out string value)
    {
        if (values.ContainsKey(key) && clock.UtcNow < expiresAt[key])
        {
            value = values[key];
            return true;
        }
        value = null;
        return false;
    }

    // Deletes the expired entries and returns how many were deleted
    public int RemoveExpired()
    {
        DateTime now = clock.UtcNow;
        var expired = new List<string>();
        foreach (var entry in expiresAt)
        {
            if (now >= entry.Value)
            {
                expired.Add(entry.Key);
            }
        }
        foreach (string key in expired)
        {
            values.Remove(key);
            expiresAt.Remove(key);
        }
        return expired.Count;
    }`,
        ),
        CACHE_MAIN,
        "using System.Collections.Generic;",
        CACHE_CHECK,
      ),
      expectedOutput:
        "ok: the fake clock shows the start time\nok: Advance moves the fake clock\nok: a fresh value is found\nok: a missing key is not found\nok: a value is still there after 4:59\nok: a value is gone after exactly 5 minutes\nok: Set again restarts the timer\nok: RemoveExpired removes only the expired entries\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "integration-tests", title: { en: "Integration tests with WebApplicationFactory", uk: "Інтеграційні тести з WebApplicationFactory" } },
    {
      kind: "quiz",
      slug: "testing-advanced-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "xunit-instances",
          mode: "single",
          prompt: { en: "A test class has 5 `[Fact]` methods. How many instances of the class does xUnit create?", uk: "Тестовий клас має 5 методів `[Fact]`. Скільки екземплярів класу створює xUnit?" },
          options: [
            { id: "a", text: { en: "5: a new instance for every test, so fields never leak between tests", uk: "5: новий екземпляр для кожного тесту, тож поля не перетікають між тестами" } },
            { id: "b", text: { en: "1: one instance is shared by all the tests of the class", uk: "1: один екземпляр спільний для всіх тестів класу" } },
            { id: "c", text: { en: "None: test methods must be static", uk: "Жодного: тестові методи мають бути статичними" } },
          ],
          correct: ["a"],
        },
        {
          id: "class-fixture",
          mode: "single",
          prompt: {
            en: "Starting a database container takes 5 seconds. How do you start it once for all the tests of one xUnit class?",
            uk: "Запуск контейнера з базою даних триває 5 секунд. Як запустити його один раз для всіх тестів одного класу xUnit?",
          },
          options: [
            { id: "a", text: { en: "Put it in a fixture class and implement `IClassFixture<TFixture>`; xUnit creates the fixture once and passes it to the constructor", uk: "Винести його в клас-фікстуру і реалізувати `IClassFixture<TFixture>`; xUnit створить фікстуру один раз і передасть її в конструктор" } },
            { id: "b", text: { en: "Start it in the constructor of the test class", uk: "Запускати його в конструкторі тестового класу" } },
            { id: "c", text: { en: "Store it in a static field and start it in the first test", uk: "Зберегти його в статичному полі і запустити в першому тесті" } },
          ],
          correct: ["a"],
        },
        {
          id: "async-test",
          mode: "single",
          prompt: { en: "How should a test of an `async` method be written?", uk: "Як правильно написати тест `async`-методу?" },
          options: [
            { id: "a", text: { en: "`public async Task` test that awaits the call, and `await Assert.ThrowsAsync<...>(...)` for exceptions", uk: "Тест `public async Task`, що очікує виклик через `await`, і `await Assert.ThrowsAsync<...>(...)` для винятків" } },
            { id: "b", text: { en: "`public async void`, so the framework does not have to wait", uk: "`public async void`, щоб фреймворку не треба було чекати" } },
            { id: "c", text: { en: "A synchronous test that reads `.Result`", uk: "Синхронний тест, що читає `.Result`" } },
          ],
          correct: ["a"],
        },
        {
          id: "flaky",
          mode: "multi",
          prompt: { en: "Which of these make tests flaky (they sometimes pass, sometimes fail)?", uk: "Що з переліченого робить тести нестабільними (то проходять, то падають)?" },
          options: [
            { id: "a", text: { en: "Reading `DateTime.Now` in the code under test", uk: "Читання `DateTime.Now` у коді, що тестується" } },
            { id: "b", text: { en: "Static state shared by tests that run in parallel", uk: "Статичний стан, спільний для тестів, що виконуються паралельно" } },
            { id: "c", text: { en: "`Thread.Sleep(500)` to wait for background work", uk: "`Thread.Sleep(500)`, щоб дочекатися фонової роботи" } },
            { id: "d", text: { en: "A fake clock that the test moves by hand", uk: "Фейковий годинник, який тест рухає вручну" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "httpclient",
          mode: "single",
          prompt: { en: "How do you unit test a class that calls an external API through `HttpClient`?", uk: "Як модульно протестувати клас, що викликає зовнішній API через `HttpClient`?" },
          options: [
            { id: "a", text: { en: "Give it an `HttpClient` built on a fake `HttpMessageHandler` that returns prepared responses", uk: "Дати йому `HttpClient`, побудований на фейковому `HttpMessageHandler`, що повертає підготовлені відповіді" } },
            { id: "b", text: { en: "Call the real API from the test", uk: "Викликати справжній API з тесту" } },
            { id: "c", text: { en: "Mock `HttpClient.GetAsync` with Moq", uk: "Замокати `HttpClient.GetAsync` за допомогою Moq" } },
          ],
          correct: ["a"],
        },
        {
          id: "web-app-factory",
          mode: "single",
          prompt: { en: "What does `WebApplicationFactory<Program>` give an integration test?", uk: "Що дає інтеграційному тесту `WebApplicationFactory<Program>`?" },
          options: [
            { id: "a", text: { en: "The whole app with its real pipeline, running in memory on a test server, and an `HttpClient` that calls it without a network port", uk: "Увесь застосунок зі справжнім конвеєром, запущений у пам'яті на тестовому сервері, і `HttpClient`, що викликає його без мережевого порту" } },
            { id: "b", text: { en: "Mocks for every controller", uk: "Моки для кожного контролера" } },
            { id: "c", text: { en: "A copy of the production database", uk: "Копію продакшн-бази даних" } },
          ],
          correct: ["a"],
        },
        {
          id: "ef-inmemory",
          mode: "single",
          prompt: { en: "Why is the EF Core InMemory provider a weak choice for testing data access code?", uk: "Чому провайдер EF Core InMemory — слабкий вибір для тестування коду доступу до даних?" },
          options: [
            { id: "a", text: { en: "It is not a relational database: no SQL, constraints or real transactions, so a test can pass while the same code fails on the real database", uk: "Це не реляційна база даних: немає SQL, обмежень і справжніх транзакцій, тож тест може пройти, а той самий код упаде на справжній базі" } },
            { id: "b", text: { en: "It is slower than PostgreSQL", uk: "Він повільніший за PostgreSQL" } },
            { id: "c", text: { en: "It only works on Windows", uk: "Він працює лише на Windows" } },
          ],
          correct: ["a"],
        },
        {
          id: "private-methods",
          mode: "single",
          prompt: { en: "A private method has complex logic. How do you test it?", uk: "Приватний метод містить складну логіку. Як його протестувати?" },
          options: [
            { id: "a", text: { en: "Through the public method that uses it; if that is too hard, move the logic into its own class with a public API", uk: "Через публічний метод, який його використовує; якщо це надто складно, винести логіку в окремий клас із публічним API" } },
            { id: "b", text: { en: "Call it through reflection", uk: "Викликати його через рефлексію" } },
            { id: "c", text: { en: "Make it public just for the tests", uk: "Зробити його публічним лише заради тестів" } },
          ],
          correct: ["a"],
        },
        {
          id: "pyramid",
          mode: "single",
          prompt: { en: "What does the test pyramid recommend?", uk: "Що радить піраміда тестування?" },
          options: [
            { id: "a", text: { en: "Many fast unit tests, fewer integration tests, and only a few slow end-to-end tests", uk: "Багато швидких модульних тестів, менше інтеграційних і лише кілька повільних наскрізних (end-to-end)" } },
            { id: "b", text: { en: "Mostly end-to-end tests, because they are closest to the user", uk: "Переважно наскрізні тести, бо вони найближчі до користувача" } },
            { id: "c", text: { en: "The same number of tests at every level", uk: "Однакову кількість тестів на кожному рівні" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
