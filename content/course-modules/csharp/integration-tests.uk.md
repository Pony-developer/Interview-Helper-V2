Модульні тести доводять, що працює кожна частина. Вони не доводять, що частини працюють **разом**: що маршрут зареєстровано, JSON має очікувану форму, впровадження залежностей може зібрати контролер, SQL виконується на справжній базі, а проміжне ПЗ повертає 401 без токена. Це робота **інтеграційних тестів**.

## Скільки яких тестів

Класична **піраміда тестування**:

- унизу — **багато модульних тестів**: мілісекунди кожен, точні, запускаються на кожне збереження;
- посередині — **менше інтеграційних тестів**: секунди кожен, перевіряють стики (HTTP, база даних, серіалізація, DI);
- нагорі — **кілька наскрізних (end-to-end) тестів**: справжній браузер проти розгорнутої системи (Playwright, Selenium); повільні й крихкі, але найближчі до користувача.

Для веб-API багато команд надають більше ваги середині («тестовий трофей» Кента К. Доддса): тест, що надсилає застосунку справжній HTTP-запит і перевіряє відповідь, покриває багато коду й добре переживає рефакторинг. Так чи інакше, повільних тестів має бути небагато.

## WebApplicationFactory

Пакет `Microsoft.AspNetCore.Mvc.Testing` запускає **весь застосунок у пам'яті**: справжній `Program`, конфігурацію, DI-контейнер, конвеєр проміжного ПЗ, маршрутизацію й контролери — поверх `TestServer` у пам'яті замість Kestrel. Ви отримуєте `HttpClient`, що викликає застосунок без відкриття мережевого порту.

```csharp
public class ProductsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ProductsApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProduct_Existing_Returns200AndJson()
    {
        var response = await client.GetAsync("/api/products/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var product = await response.Content.ReadFromJsonAsync<ProductDto>();
        Assert.Equal("Keyboard", product!.Name);
    }

    [Fact]
    public async Task CreateProduct_WithoutName_Returns400()
    {
        var response = await client.PostAsJsonAsync("/api/products", new { price = 10 });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
```

`WebApplicationFactory<Program>` має бачити клас `Program` застосунку. З інструкціями верхнього рівня цей клас генерує компілятор, і він внутрішній (internal); до .NET 10 наприкінці `Program.cs` дописували `public partial class Program { }` (або використовували `InternalsVisibleTo`). Починаючи з .NET 10 фреймворк генерує публічне оголошення сам.

Фабрику дорого будувати, тож діліться нею через `IClassFixture` (один застосунок на тестовий клас) або фікстуру колекції.

## Підміна сервісів для тесту

Застосунок справжній, але деякі його залежності такими бути не повинні: ви не хочете знімати гроші зі справжніх карток чи надсилати справжні листи. Успадкуйте фабрику або викличте `WithWebHostBuilder` і замініть реєстрації:

```csharp
public class ApiFactory : WebApplicationFactory<Program>
{
    public FakeMailer Mailer { get; } = new FakeMailer();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IMailer>();
            services.AddSingleton<IMailer>(Mailer);
            services.RemoveAll<IPaymentGateway>();
            services.AddSingleton<IPaymentGateway, AlwaysApprovesGateway>();
        });
    }
}
```

`ConfigureTestServices` виконується **після** власних реєстрацій застосунку, тож ваші дублери перемагають. Підміняйте лише те, що виходить за межі процесу і не належить вам: платежі, пошту, сторонні API. Власний код, а по можливості й власну базу даних, лишайте справжніми.

Часто підміняють і автентифікацію: тестовий обробник автентифікації входить кожним запитом як відомий тестовий користувач, і тестам не потрібні справжні токени.

## База даних

Саме тут інтеграційні тести окупаються — і саме тут їх найчастіше роблять неправильно.

| Варіант | Вердикт |
| --- | --- |
| **Провайдер EF Core InMemory** | Не реляційна база: немає SQL, обмежень, справжніх транзакцій, інша поведінка запитів. Тести проходять, а продакшн падає. Документація Microsoft сама не радить його для тестування. |
| **SQLite у пам'яті** | Справжня SQL-база і швидка, але інший рушій, ніж ваш SQL Server чи PostgreSQL: відрізняються типи, функції й блокування. |
| **Справжній рушій у контейнері (Testcontainers)** | Той самий рушій і версія, що в продакшні; кілька секунд на старт. Звичайний вибір сьогодні. |

```csharp
public class DbFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    public string ConnectionString => container.GetConnectionString();

    public Task InitializeAsync() => container.StartAsync();
    public Task DisposeAsync() => container.DisposeAsync().AsTask();
}
```

Testcontainers запускає одноразовий Docker-контейнер на час прогону тестів. Запускайте його раз на прогін або на колекцію, застосуйте міграції і спрямуйте застосунок на нього в `ConfigureTestServices`.

Тести, що ділять базу, не мають бачити дані одне одного. Поширені стратегії:

- **унікальні дані на тест**: кожен тест створює власного клієнта з новим id і запитує лише його;
- **скидання між тестами**: видаляти дані (бібліотека Respawn робить це швидко і в правильному порядку зовнішніх ключів);
- **транзакція на тест**, яку наприкінці відкочують (швидко, але не працює, коли код, що тестується, сам фіксує транзакції).

## Як тримати інтеграційні тести здоровими

- Запускайте їх у CI на кожен pull request, а не «іноді перед релізом».
- Позначайте їх (`[Trait("Category", "Integration")]`), щоб розробники могли локально запускати лише швидкі тести.
- Ніколи не залежте від порядку тестів чи від даних, створених іншим тестом.
- Жодних справжніх зовнішніх сервісів: тест, що падає, бо лежить пісочниця партнера, привчає команду ігнорувати червоні збирання.
- Перевіряйте **поведінку, видиму ззовні**: коди статусу, тіла відповідей, що опинилося в базі, що отримав фейковий поштовик. Не приватні деталі.

## На співбесіді

«Як ви тестуєте ASP.NET Core API?» Добра відповідь має шари: модульні тести для доменної логіки з фейками на межах; інтеграційні тести через `WebApplicationFactory` зі справжнім конвеєром, зовнішніми сервісами, підміненими в `ConfigureTestServices`, і справжньою базою в контейнері; кілька наскрізних тестів для критичних шляхів користувача; і все це запускається в CI.
