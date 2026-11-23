Кроки, зареєстровані на те саме повідомлення, часто мають передавати дані один одному: PreOperation-крок бачить старі значення, а PostOperation-кроку вони потрібні після збереження. Класи плагінів не повинні зберігати стан у полях, тож Dataverse дає належний канал: **`context.SharedVariables`**.

## Як це працює

`SharedVariables` — це словник у контексті виконання. Кожен крок, що виконується для **тієї самої операції** (те саме повідомлення для того самого запису в тому самому виконанні конвеєра), бачить ту саму колекцію:

```csharp
// PreOperation-крок на Update акаунта
Money before = context.PreEntityImages["PreImage"].GetAttributeValue<Money>("creditlimit");
context.SharedVariables["oldCreditLimit"] = before?.Value ?? 0m;

// PostOperation-крок на Update акаунта
if (context.SharedVariables.Contains("oldCreditLimit"))
{
    var oldLimit = (decimal)context.SharedVariables["oldCreditLimit"];
    // порівняти з новим значенням, записати нотатку аудиту...
}
```

Типові застосування:

- Передати значення «до», обчислені на PreOperation, у PostOperation (часто дешевше, ніж другий образ).
- Передати прапорець: «крок перевірки вже завантажив батьківський акаунт, ось його id».
- Дати одному кроку сказати іншому пропустити роботу: `SharedVariables["contoso.skipRecalc"] = true`.

## Правила

- **Лише та сама операція.** Shared variable не переживає перехід в *інше* повідомлення. Якщо ваш PostOperation-крок викликає `service.Update` для іншого запису, плагіни цього нового Update отримують власний контекст.
- **Перевіряйте перед читанням.** Крок, що задає значення, може бути вимкнений, відфільтрований чи незареєстрований у цьому середовищі. Використовуйте `Contains` і розумне типове значення.
- **Прості значення.** Зберігайте рядки, числа, булеві значення, `Guid` і типи SDK на кшталт `EntityReference`. Контексти можуть серіалізуватися (наприклад, для асинхронних кроків), тож уникайте власних складних об'єктів.
- **Ключі з простором імен.** Використовуйте префікс на кшталт `contoso.`, щоб ключі з різних рішень не конфліктували.

## PreValidation і батьківський контекст

PreValidation може виконуватися поза транзакцією, у тому, що платформа вважає зовнішнім виконанням. Тому значення, задане на PreValidation, на пізнішому етапі може бути не в `context.SharedVariables`, а в **`context.ParentContext.SharedVariables`**. Поширений допоміжний метод шукає в обох місцях:

```csharp
static bool TryGetShared(IPluginExecutionContext context, string key, out object value)
{
    for (var c = context; c != null; c = c.ParentContext)
        if (c.SharedVariables.TryGetValue(key, out value)) return true;
    value = null;
    return false;
}
```

Через `ParentContext` плагін також бачить операцію, що його спричинила, наприклад Create замовлення, яке призвело до Create його рядків.

## Передавання даних від того, хто викликає

Клієнт може покласти значення в shared variables операції, яку запускає, додавши до запиту необов'язковий параметр **`tag`** (`request.Parameters["tag"] = "import-2026-11"`). Плагіни читають його як `context.SharedVariables["tag"]`. Інтеграції так кажуть плагінам «ця зміна прийшла з нічного імпорту», щоб ті могли поводитися інакше.

## На співбесіді

- Поясніть, що таке shared variables і чому вони існують замість полів класу.
- Покажіть передавання старого значення з PreOperation у PostOperation.
- Поясніть, чому значення з PreValidation може бути лише в `ParentContext`.
- Поясніть, як той, хто викликає, може передати плагінам tag.
