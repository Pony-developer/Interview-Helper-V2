Усе, що читає чи записує дані Dataverse, проходить через його **веб-сервіси**. Основних ендпоінтів два, і за ними та сама платформа: ті самі повідомлення, та сама безпека й ті самі плагіни.

## Web API

**Web API** — це RESTful-ендпоінт **OData v4**, що працює з JSON через HTTPS. Його може використовувати будь-яка мова й платформа.

```text
GET https://contoso.crm4.dynamics.com/api/data/v9.2/accounts?$select=name,revenue&$top=3
Authorization: Bearer <token>
Accept: application/json
OData-MaxVersion: 4.0
OData-Version: 4.0
```

- До таблиць звертаються за **ім'ям набору сутностей** (`accounts`), до записів — за id (`accounts(<guid>)`) або альтернативним ключем.
- `POST` створює, `PATCH` оновлює (або робить upsert), `DELETE` видаляє, `GET` читає з `$select`, `$filter`, `$orderby`, `$expand`, `$top`.
- Повідомлення, що не є CRUD, — це **функції** (`GET …/WhoAmI`) і **дії** (`POST …/Microsoft.Dynamics.CRM.QualifyLead`), включно з вашими Custom API.
- `$batch` надсилає кілька операцій в одному HTTP-запиті, за потреби як одну транзакцію (*change set*).
- `GET /api/data/v9.2/$metadata` повертає повний опис сервісу, згенерований із ваших таблиць.

Скрипти форм використовують його через `Xrm.WebApi`; JavaScript, Python, власні конектори Power Automate і більшість інтеграцій викликають його напряму.

## Organization service і .NET SDK

**Organization service** — це ендпоінт, на якому працює **SDK для .NET**. Вручну його не викликають: ви використовуєте `IOrganizationService`, який реалізує `ServiceClient` (пакет `Microsoft.PowerPlatform.Dataverse.Client`), з типізованими класами `Entity`, `EntityReference`, `QueryExpression` і парами запит/відповідь.

```csharp
using var client = new ServiceClient(connectionString);
var response = (WhoAmIResponse)client.Execute(new WhoAmIRequest());
Console.WriteLine(response.UserId);
```

Його базовий протокол — SOAP, тому старіша документація називає його «SOAP-ендпоінтом» (`/XRMServices/2011/Organization.svc`). Викликати цей SOAP-ендпоінт напряму з інших мов — застарілий підхід; новий код не на .NET має використовувати Web API. Для .NET SDK лишається найзручнішим вибором, особливо для масових операцій і early-bound класів.

## Що коли використовувати

| Ситуація | Вибір |
| --- | --- |
| Консольний застосунок на C#, Azure Function, міграція даних | SDK для .NET (`ServiceClient`) |
| JavaScript у формі чи PCF-контролі | Web API через `Xrm.WebApi` / `context.webAPI` |
| Python, Node.js, Java, будь-який HTTP-клієнт | Web API |
| Код усередині плагіна | Жоден ендпоінт: `IOrganizationService`, який дає платформа |

Останній рядок важливий: плагін виконується **всередині** платформи. Він отримує `IOrganizationService` від `IOrganizationServiceFactory`, уже автентифікований як потрібний користувач, і його виклики не йдуть через HTTP. Ніколи не створюйте `ServiceClient` і не викликайте Web API через `HttpClient` із плагіна, щоб звернутися до того самого середовища.

## Автентифікація

Обидва ендпоінти використовують **OAuth 2.0 з Microsoft Entra ID**. Користувач входить інтерактивно, а сервіс використовує **реєстрацію застосунку** (секрет клієнта, сертифікат або керовану ідентичність), додану в середовище як **application user** з роллю безпеки. MSAL отримує токен для ресурсу `https://<org>.crm.dynamics.com/.default`; `ServiceClient` робить це за вас із рядка підключення.

## Пошук середовищ

**Global Discovery Service** перелічує середовища, доступні користувачу, з їхніми URL. Інструменти, що працюють із кількома середовищами, спершу викликають його, а потім під'єднуються до Web API чи Organization service вибраного середовища.

## Застарілі ендпоінти

**Organization data service** (OData v2, `OrganizationData.svc`), старе використання **SOAP 2011** з JavaScript і стара автентифікація «Office 365» логіном і паролем вилучені або застаріли. Ви ще зустрінете їх у старому коді; заміна — поширене завдання під час модернізації системи.

## На співбесіді

- Назвіть два ендпоінти й скажіть, які клієнти що використовують.
- Напишіть запит Web API з `$select` і `$filter`, поясніть функції, дії та `$batch`.
- Поясніть, як плагін працює з Dataverse і чому він не повинен через HTTP викликати власне середовище.
- Поясніть, як автентифікується фоновий сервіс.
