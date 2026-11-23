## Звідки беруться налаштування

`WebApplication.CreateBuilder` читає конфігурацію з кількох **джерел** у такому порядку. Пізніше джерело **перекриває** раніше:

1. `appsettings.json`;
2. `appsettings.{Environment}.json`, наприклад `appsettings.Development.json`;
3. секрети користувача (лише в середовищі Development);
4. змінні середовища;
5. аргументи командного рядка.

Тож та сама збірка може працювати будь-де: файл містить значення за замовчуванням, а кожен сервер перекриває те, що відрізняється, через змінні середовища.

Ключі ієрархічні, з `:` між рівнями:

```json
{
  "Smtp": { "Host": "localhost", "Port": 25 },
  "ConnectionStrings": { "Default": "Host=localhost;Database=shop" }
}
```

```csharp
string host = builder.Configuration["Smtp:Host"];
int port = builder.Configuration.GetValue<int>("Smtp:Port");
string db = builder.Configuration.GetConnectionString("Default");
```

У змінних середовища `:` пишуть як подвійне підкреслення: `Smtp__Host=mail.example.com`.

## Середовище

Змінна `ASPNETCORE_ENVIRONMENT` (`Development`, `Staging`, `Production`) обирає файл середовища і дає коду змогу поводитися по-різному:

```csharp
if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();
```

## Патерн Options

Читати рядки за ключем по всьому коду крихко. Натомість прив'яжіть секцію до класу:

```csharp
public class SmtpOptions
{
    [Required] public string Host { get; set; } = "";
    [Range(1, 65535)] public int Port { get; set; }
}

builder.Services.AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection("Smtp"))
    .ValidateDataAnnotations()
    .ValidateOnStart();          // неправильне налаштування зупинить застосунок на старті, а не на першому листі

public class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions smtp = options.Value;
}
```

Три інтерфейси дають доступ до налаштувань:

| Інтерфейс | Час життя | Бачить зміни у файлах |
|---|---|---|
| `IOptions<T>` | singleton | ні: читається один раз |
| `IOptionsSnapshot<T>` | scoped | так, з наступного запиту |
| `IOptionsMonitor<T>` | singleton | так, одразу, з колбеком `OnChange` |

## Секрети

Паролі, API-ключі та рядки підключення з паролями **ніколи** не можна комітити в `appsettings.json`:

- під час розробки використовуйте **секрети користувача** (`dotnet user-secrets set "Smtp:Password" "..."`), що зберігаються поза текою проєкту;
- у продакшені — змінні середовища або сховище секретів, як-от Azure Key Vault чи AWS Secrets Manager.

## Правило

Тримайте значення за замовчуванням в `appsettings.json`, перекривайте їх для кожного середовища, прив'язуйте секції до класів налаштувань із валідацією і тримайте секрети поза репозиторієм.
