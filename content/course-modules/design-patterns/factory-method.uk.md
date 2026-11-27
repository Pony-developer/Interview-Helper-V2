**Простими словами:** фабрика — це **одне місце, яке вирішує, який об'єкт створити**. Решта коду каже, *що їй потрібно* («сповіщувач для SMS»), і отримує об'єкт за інтерфейсом, не знаючи конкретного класу.

## Картинка з життя

У піцерії ви замовляєте «Маргариту». Ви не йдете на кухню вибирати борошно, піч і кухаря. Кухня (фабрика) знає, як її приготувати, і видає вам результат.

## Проблема

```csharp
// Розкидано по всьому коду:
INotifier notifier;
if (channel == "email") notifier = new EmailNotifier();
else if (channel == "sms") notifier = new SmsNotifier();
else ...
```

Кожне місце, що створює сповіщувачі, повторює цей `if`. Додали Teams — доведеться знайти й виправити їх усі.

## Проста фабрика

Покладіть рішення в одне місце:

```csharp
static class NotifierFactory
{
    public static INotifier Create(string channel)
    {
        switch (channel)
        {
            case "email": return new EmailNotifier();
            case "sms": return new SmsNotifier();
            default: throw new ArgumentException("Unknown channel: " + channel);
        }
    }
}

INotifier notifier = NotifierFactory.Create(user.PreferredChannel);
```

Строго кажучи, ця «проста фабрика» не входить до 23 патернів GoF, але саме її ви писатимете найчастіше.

## Factory Method (версія GoF)

Тут **базовий клас** задає алгоритм і залишає **один метод для створення об'єкта** своїм підкласам:

```csharp
abstract class ReportExporter
{
    public void Export(Report report)
    {
        var writer = CreateWriter();        // фабричний метод: ЩО створити, вирішують підкласи
        writer.Write(report);
    }

    protected abstract IReportWriter CreateWriter();
}

class PdfExporter : ReportExporter
{
    protected override IReportWriter CreateWriter() { return new PdfWriter(); }
}

class ExcelExporter : ReportExporter
{
    protected override IReportWriter CreateWriter() { return new ExcelWriter(); }
}
```

## Коли застосовувати, а коли ні

- **Пасує:** конкретний клас залежить від даних (конфігурації, вибору користувача, типу запису) або створення складне й не хочеться його повторювати.
- **Зайве:** фабрика, що завжди створює той самий один клас. Просто викличте `new`.

## Запам'ятайте

Фабрика відповідає на питання «**хто вирішує, який клас створити?**» Відповідь: одне місце, а не всі. Нові типи додаються в цьому одному місці (принцип відкритості/закритості).
