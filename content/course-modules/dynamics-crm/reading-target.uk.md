Більшість плагінів починають із читання запису, що зберігається: **основної сутності** (primary entity) повідомлення. Її дані беруться з трьох місць: **Target**, **образів** і, якщо нічого не допомагає, **Retrieve**.

## Безпечно отримуємо Target

```csharp
if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity target))
    return;                                  // у Delete — EntityReference; деякі повідомлення не мають Target
if (target.LogicalName != "account")
    return;
```

`context.PrimaryEntityName` і `context.PrimaryEntityId` описують той самий запис. На **PreOperation для Create** id зазвичай ще порожній (якщо його не передав той, хто викликає); починаючи з PostOperation, `context.PrimaryEntityId` і `context.OutputParameters["id"]` містять новий id.

## Читання стовпців

```csharp
string name        = target.GetAttributeValue<string>("name");                 // null, якщо немає
int? employees     = target.GetAttributeValue<int?>("numberofemployees");      // nullable-тип значення
Money creditLimit  = target.GetAttributeValue<Money>("creditlimit");           // creditLimit?.Value
OptionSetValue ind = target.GetAttributeValue<OptionSetValue>("industrycode"); // ind?.Value
EntityReference pc = target.GetAttributeValue<EntityReference>("primarycontactid"); // pc?.Id, pc?.LogicalName
DateTime? created  = target.GetAttributeValue<DateTime?>("createdon");         // завжди UTC
bool doNotEmail    = target.GetAttributeValue<bool>("donotemail");             // false, якщо немає
```

- **`GetAttributeValue<T>`** повертає `default(T)`, коли стовпця немає або він null. Використовуйте nullable-типи (`int?`, `DateTime?`), коли «немає» і «нуль» означають різне.
- **Індексатор** `target["creditlimit"]` кидає **`KeyNotFoundException`**, коли стовпця немає в Target. Це класичне падіння плагіна на Update, коли користувач змінив інший стовпець.
- **`Contains("column")`** повертає true, коли стовпець є в запиті, **навіть якщо його значення null**: користувач, що очищує поле, надсилає стовпець із `null`. «Немає в Target» означає *не змінено*; «є в Target із null» означає *очищено*.

## У lookup-полів немає назв

`EntityReference` у Target зазвичай має лише `LogicalName` та `Id`; `Name` часто порожній. Щоб показати чи використати дані пов'язаного запису, отримайте його:

```csharp
var contact = service.Retrieve("contact", pc.Id, new ColumnSet("fullname", "emailaddress1"));
```

Так само `FormattedValues` (підписи choice, відформатовані гроші) у Target не заповнені; читайте підписи з метаданих або працюйте з числовими значеннями.

## Update: Target — це не весь запис

Для Update Target містить **лише змінені стовпці**. Щоб знати повний стан, зареєструйте **pre-image** (а на PostOperation — **post-image**) з потрібними стовпцями й поєднуйте:

```csharp
static T Current<T>(Entity target, Entity preImage, string column) =>
    target.Contains(column) ? target.GetAttributeValue<T>(column) : preImage.GetAttributeValue<T>(column);

var preImage = context.PreEntityImages.Contains("PreImage") ? context.PreEntityImages["PreImage"] : new Entity(target.LogicalName);
Money limit = Current<Money>(target, preImage, "creditlimit");
```

Retrieve того самого запису дає ту саму інформацію, але коштує звернення до бази під час кожного збереження; образи дешевші й дають значення *до* зміни, яких Retrieve на PostOperation дати не може.

## Запис назад

- На **PreValidation/PreOperation** задавайте стовпці в Target: `target["description"] = …`. Вони збережуться разом із записом.
- На **PostOperation** запис уже збережено: використовуйте `service.Update(new Entity(target.LogicalName, target.Id) { ["description"] = … })`, що запускає нове повідомлення Update (стежте за циклами).

## На співбесіді

- Покажіть, як прочитати з Target рядок, гроші, choice і lookup.
- Поясніть різницю між `GetAttributeValue`, індексатором і `Contains`, включно з очищеним полем.
- Поясніть, чому lookup-поля в Target не мають назв і що з цим робити.
- Поясніть, як отримати повний стан запису в плагіні на Update.
