Ви вже знаєте `[Fact]`, `[Theory]` і `Assert.Equal`. Ця лекція — про наступні запитання, що виникають у реальних проєктах і на співбесідах: коли створюється тестовий клас, як спільно використовувати дороге налаштування, як подавати в тести дані і що виконується паралельно.

## Новий екземпляр для кожного тесту

xUnit створює **новий екземпляр тестового класу для кожного тесту**: для кожного `[Fact]` і для кожного рядка даних `[Theory]`. Отже:

- **конструктор** — це налаштування «перед кожним тестом»;
- **`IDisposable.Dispose`** — прибирання «після кожного тесту»;
- поля екземпляра ніколи не перетікають з одного тесту в інший.

```csharp
public class CartTests : IDisposable
{
    private readonly Cart cart = new Cart();     // новий для кожного тесту

    public CartTests() { /* налаштування для кожного тесту */ }

    [Fact]
    public void NewCart_IsEmpty() { Assert.Empty(cart.Items); }

    public void Dispose() { /* прибирання після кожного тесту */ }
}
```

Для асинхронного налаштування реалізуйте `IAsyncLifetime`: `InitializeAsync` виконується після конструктора, `DisposeAsync` — після тесту.

Як це роблять інші:

- **NUnit** за замовчуванням створює **один екземпляр на фікстуру** і виконує на ньому всі її тести. Поля зберігають значення між тестами, тож стан скидають у методі `[SetUp]`. (`[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]` вмикає поведінку як у xUnit.)
- **MSTest** створює новий екземпляр на кожен тест, як xUnit, і має `[TestInitialize]` / `[TestCleanup]`.

Статичні поля спільні для всього в процесі в будь-якому фреймворку. Уникайте статичного змінного стану в тестах.

## Спільне дороге налаштування: фікстури

Запускати контейнер із базою даних чи будувати великий граф об'єктів для кожного тесту — надто повільно. xUnit ділиться такими речами через **фікстури** (fixtures): звичайні класи, які xUnit створює один раз і передає в конструктор тестового класу.

```csharp
public class DatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; private set; }
    public async Task InitializeAsync() { /* запустити базу, застосувати міграції */ }
    public async Task DisposeAsync() { /* зупинити її */ }
}

// Одна фікстура для всіх тестів цього класу
public class OrderRepositoryTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture db;
    public OrderRepositoryTests(DatabaseFixture db) { this.db = db; }
}
```

Щоб поділити одну фікстуру між **кількома класами**, оголосіть колекцію:

```csharp
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

[Collection("Database")]
public class OrderRepositoryTests { public OrderRepositoryTests(DatabaseFixture db) { } }

[Collection("Database")]
public class CustomerRepositoryTests { public CustomerRepositoryTests(DatabaseFixture db) { } }
```

| Область | Коли створюється | Механізм |
| --- | --- | --- |
| Один тест | перед кожним тестом | конструктор / `Dispose` |
| Один клас | перед першим тестом класу | `IClassFixture<T>` |
| Кілька класів | перед першим тестом колекції | `[Collection]` + `ICollectionFixture<T>` |
| Уся збірка (xUnit v3) | один раз на запуск тестів | `[assembly: AssemblyFixture(typeof(T))]` |

Спільна фікстура — це спільний стан. Тести, що її використовують, не мають залежати від того, що лишили інші тести: дайте кожному тесту власні дані (унікальні id, нового клієнта) або скидайте стан між тестами.

## Тести, керовані даними

```csharp
[Theory]
[InlineData("", false)]
[InlineData("ann@example.com", true)]
[InlineData("ann@", false)]
public void IsValidEmail(string input, bool expected)
{
    Assert.Equal(expected, EmailValidator.IsValid(input));
}
```

`[InlineData]` приймає лише константи часу компіляції. Для всього іншого (об'єктів, дат, `decimal`) використовуйте `[MemberData]`, що читає статичний член:

```csharp
public static TheoryData<decimal, decimal, decimal> Discounts => new TheoryData<decimal, decimal, decimal>
{
    { 100m, 0.1m, 90m },
    { 50m, 0m, 50m },
};

[Theory]
[MemberData(nameof(Discounts))]
public void ApplyDiscount(decimal price, decimal rate, decimal expected) { /* ... */ }
```

`TheoryData<...>` типобезпечний; звичайний `IEnumerable<object[]>` теж працює. `[ClassData(typeof(MyCases))]` бере рядки з окремого класу.

Кожен рядок — **окремий тест** із власним результатом, тож один поганий рядок не ховає інші, на відміну від циклу всередині одного тесту.

## Паралельне виконання

xUnit групує тести в **колекції**. За замовчуванням кожен тестовий клас — окрема колекція.

- Колекції виконуються **паралельно** одна з одною.
- Тести всередині однієї колекції виконуються **один за одним**.

Отже, тести різних класів можуть іти одночасно. Тести, що звертаються до того самого спільного ресурсу (однієї бази, одного файлу, статичного поля), мають або не заважати один одному, або бути в одній `[Collection]`. Паралельність можна вимкнути для збірки атрибутом `[assembly: CollectionBehavior(DisableTestParallelization = true)]`, але ціна — повільні послідовні прогони.

**Порядок** тестів теж не визначений. Тест, що проходить лише після іншого тесту, — це помилка.

## Інші щоденні інструменти

```csharp
public class ImportTests
{
    private readonly ITestOutputHelper output;
    public ImportTests(ITestOutputHelper output) { this.output = output; }   // вивід Console не перехоплюється

    [Fact(Skip = "Waiting for the new file format")]
    public void ImportsXml() { }

    [Fact]
    [Trait("Category", "Slow")]
    public async Task ImportsLargeFile()
    {
        output.WriteLine("Starting import");
        var ex = await Assert.ThrowsAsync<FormatException>(() => importer.ImportAsync("bad.csv"));
        Assert.Contains("line 3", ex.Message);
    }
}
```

- `Assert.Throws<T>` проходить лише для точного типу `T`; `Assert.ThrowsAny<T>` приймає й підкласи. Для асинхронного коду — `await Assert.ThrowsAsync<T>(...)`: без `await` перевірка не відбудеться.
- Трейти дозволяють обирати, що запускати: `dotnet test --filter "Category!=Slow"`.
- Асинхронні тести повертають `Task`, ніколи не `async void`.

## xUnit v3

xUnit v3 (2024) зберігає ті самі атрибути, тож більшість тестів переходять без змін. Помітні відмінності: тестовий проєкт збирається як виконуваний файл, який можна запустити напряму; `TestContext.Current` дає `CancellationToken` і помічник виводу поточного тесту; `Assert.Skip(...)` пропускає тест під час виконання; `IAsyncLifetime` повертає `ValueTask`; тести `async void` відхиляються. Перш ніж копіювати приклади з інтернету, з'ясуйте, яку версію використовує проєкт.

## Що робить запускач

Під капотом тестовий фреймворк — невелика програма:

1. Завантажити тестову збірку і знайти публічні методи з тестовими атрибутами (рефлексія).
2. Для кожного тесту створити новий екземпляр його класу (передавши фікстури в конструктор).
3. Викликати метод; для теорії — по разу для кожного рядка даних.
4. Перевірка, що не справдилась, **кидає виняток**. Запускач ловить його і фіксує падіння; метод, що завершився нормально, пройшов.
5. Звільнити екземпляр (Dispose) і звітувати про результати.

У практичному завданні ви збудуєте саме такий запускач.
