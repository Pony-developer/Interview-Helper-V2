Плагіни на Create та Update реагують на зміни даних. Але іноді потрібна **операція**: «перерахувати це замовлення», «закрити звернення з резолюцією», «імпортувати цей файл». Dataverse дає змогу визначати власні повідомлення й реалізовувати їх на C#.

## Custom API

**Custom API** — це повідомлення, яке ви визначаєте як дані у своєму рішенні:

- **Унікальне ім'я** з вашим префіксом (`contoso_RecalculateDiscount`) і відображуване ім'я.
- **Прив'язка**: неприв'язаний (глобальний), прив'язаний до таблиці (викликається для одного запису) або до колекції.
- **Функція чи дія**: функція не має побічних ефектів і викликається через `GET`; дія змінює дані й викликається через `POST`.
- **Параметри запиту** та **властивості відповіді** з типами (string, int, decimal, money, bool, EntityReference, Entity, EntityCollection…), кожен обов'язковий чи необов'язковий.
- **Тип плагіна**: клас, що реалізує основну операцію.
- За бажанням — **приватний** (прихований з документа метаданих) і обмежений **привілеєм**, який має мати той, хто викликає.

Реалізація — звичайний плагін, що читає `InputParameters` і заповнює `OutputParameters`:

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = serviceProvider.Get<IPluginExecutionContext>();
    var service = serviceProvider.Get<IOrganizationServiceFactory>().CreateOrganizationService(context.UserId);

    var orderRef = (EntityReference)context.InputParameters["Target"];  // прив'язаний до salesorder
    var coupon = (string)context.InputParameters["contoso_Coupon"];

    decimal discount = new DiscountCalculator(service).For(orderRef.Id, coupon);
    context.OutputParameters["contoso_Discount"] = discount;
}
```

Викликають його як будь-яке вбудоване повідомлення:

```text
POST [org]/api/data/v9.2/salesorders(<id>)/Microsoft.Dynamics.CRM.contoso_RecalculateDiscount
{ "contoso_Coupon": "SPRING" }
```

З C# надішліть `OrganizationRequest("contoso_RecalculateDiscount")` через `Execute`. На повідомлення вашого Custom API можна реєструвати й інші плагіни (PreValidation, PreOperation, PostOperation), так само як на Create.

## Старіші варіанти

- **Custom process actions** визначали в класичному дизайнері workflow, і їх досі можна викликати так само. Для нової роботи їх замінюють Custom API: вони визначаються в коді, підтримують функції та привілеї й не потребують визначення workflow.
- **Custom workflow activities** — класи, похідні від `CodeActivity`, що додають кроки в класичні workflow. Вони досі працюють, але класичні workflow замінює Power Automate, тож нову роботу з них не починайте.

## Плагіни, flow чи щось інше?

| Потреба | Найлегший гарний варіант |
| --- | --- |
| Показати, приховати, зробити обов'язковим поле на формі | Бізнес-правило |
| Перевірка, що має виконуватися завжди, навіть для API | Синхронний плагін |
| Заповнити стовпець запису, що зберігається | Плагін на PreOperation або formula-стовпець |
| Сповістити людей, викликати SaaS-конектори, погодження | Flow у Power Automate |
| Повторно використовувана серверна операція з входами й виходами | Custom API |
| Важка чи довга обробка | Azure Function, запущена через Service Bus або webhook |

Flow швидко будуються, і їх легко змінювати не-розробникам, але вони виконуються асинхронно, їх важче тестувати й версіонувати, і вони рахуються в ліміти Power Automate. Плагіни транзакційні та швидкі, але потребують розробника й розгортання.

## Low-code плагіни

Новіші середовища також пропонують **low-code плагіни** на Power Fx: миттєві (операція, схожа на Custom API) та автоматичні (на Create, Update, Delete). Вони зручні для простих правил, якими опікуються мейкери; складна логіка й далі належить C#.

## На співбесіді

- Поясніть, що таке Custom API, різницю між прив'язаним і неприв'язаним, функцією й дією.
- Покажіть, як плагін читає вхідні параметри й повертає вихідні.
- Поясніть, чому Custom API замінюють custom process actions і custom workflow activities.
- Оберіть між бізнес-правилом, плагіном, flow і Custom API для конкретної вимоги.
