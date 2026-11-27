Щоб писати добрі плагіни, не обов'язково бути експертом із C#, але кілька можливостей мови потрібні щодня. Якщо ви прийшли з JavaScript чи іншої мови, ця сторінка — короткий список.

## Клас, що реалізує інтерфейс

Кожен плагін — це клас, що реалізує інтерфейс `IPlugin` з одним методом:

```csharp
using System;
using Microsoft.Xrm.Sdk;

namespace Contoso.Plugins
{
    public class AccountPreCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // ваш код
        }
    }
}
```

- `using` імпортує простори імен, щоб писати `Entity` замість `Microsoft.Xrm.Sdk.Entity`.
- `namespace` групує ваші класи; кроки плагіна реєструють за повним ім'ям `Contoso.Plugins.AccountPreCreate`.
- `: IPlugin` означає «цей клас реалізує цей інтерфейс»: він обіцяє мати метод `Execute`.

## Отримання сервісу: приведення типів

Платформа дає вам `IServiceProvider`. Ви просите в нього сервіс за типом і **приводите** результат:

```csharp
var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
```

`(Type)value` перетворює `object` на тип, яким він, як ви знаєте, є. Якщо ви помиляєтеся, кидається `InvalidCastException`. Безпечніша форма `value as Type` повертає `null`, а `value is Type t` перевіряє й перетворює одразу:

```csharp
if (context.InputParameters["Target"] is Entity target) { /* використовуємо target */ }
```

## Типи, що трапляються постійно

| Тип | Приклад | Для чого |
| --- | --- | --- |
| `string` | `"Contoso"` | Текст. Порівнюйте через `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)`, коли регістр не важить |
| `int`, `int?` | `500`, `null` | Цілі числа; `?` робить тип **nullable** |
| `decimal` | `1500.50m` | Гроші й точні суми. Ніколи не `double` для грошей |
| `bool` | `true` | Стовпці Yes/No |
| `DateTime` | `DateTime.UtcNow` | Дати. Dataverse зберігає UTC, тож `UtcNow`, а не `Now` |
| `Guid` | `Guid.Empty` | Id записів |

## Null: найчастіша помилка

Порожній стовпець — це `null`. Виклик методу на `null` кидає `NullReferenceException` — помилку, яку нові розробники Dynamics бачать найчастіше. Три інструменти запобігають їй:

```csharp
string city = account.GetAttributeValue<string>("address1_city");
int length = city?.Length ?? 0;            // ?. зупиняється на null, ?? дає значення за замовчуванням
if (string.IsNullOrWhiteSpace(city)) { }   // порожнє, null і пробіли однією перевіркою
```

## Колекції та LINQ

```csharp
var names = new List<string> { "Contoso", "Fabrikam" };
var lookup = new Dictionary<string, int> { { "Gold", 100000002 } };

using System.Linq;
var active = accounts.Where(a => a.GetAttributeValue<OptionSetValue>("statecode").Value == 0)
                     .Select(a => a.GetAttributeValue<string>("name"))
                     .ToList();
```

`Where` фільтрує, `Select` перетворює, `FirstOrDefault` повертає перший збіг або `null`, `Any` питає «чи є хоч один?». Частина `a => …` — це **лямбда**: маленька вбудована функція.

## Винятки

```csharp
throw new InvalidPluginExecutionException("The credit limit cannot be negative.");
```

Такий виняток у синхронному плагіні зупиняє збереження, відкочує транзакцію й показує ваше повідомлення користувачу. Обгортайте в `try`/`catch` код, що може впасти з технічних причин, записуйте деталі в трасування й кидайте далі зрозуміле повідомлення.

## Чого плагінам слід уникати

- **Статичних полів із даними** між виконаннями: один екземпляр плагіна обслуговує багатьох користувачів одночасно.
- **`async`/`await` і потоків**: плагіни виконуються синхронно в sandbox.
- **`DateTime.Now`**: використовуйте UTC.
- **Зашитих у код id та URL**: вони різні в різних середовищах; використовуйте конфігурацію.

## Де потренуватися

Кожна практика на C# у цьому курсі виконується в браузері. Почніть із трьох у цьому модулі: вони використовують ті самі класи `Entity`, `EntityReference`, `OptionSetValue` і `Money`, що й справжні плагіни.
