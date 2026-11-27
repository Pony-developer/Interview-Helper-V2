**Простими словами:** Bridge розділяє клас, що змінюється у **двох незалежних напрямках**, на **дві окремі ієрархії**, з'єднані посиланням. Після цього кожна сторона може рости сама.

## Картинка з життя

Пульт і телевізор. Є багато видів пультів (простий, із голосовим керуванням) і багато марок телевізорів. Будь-який пульт працює з будь-яким телевізором, бо вони домовилися про невеликий набір сигналів. Не потрібен окремий продукт «голосовий пульт для Samsung» і «голосовий пульт для LG».

## Проблема

Сповіщення бувають різних видів: **тривога**, **нагадування**, **звіт**. Вони можуть іти каналами: **email**, **SMS**, **Teams**. З успадкуванням отримаємо `EmailAlert`, `SmsAlert`, `TeamsAlert`, `EmailReminder`... 3 × 3 = 9 класів, а новий канал означає ще три класи.

## На C#

```csharp
// Сторона 1: ЯК доставити («реалізація»)
interface IChannel
{
    void Deliver(string to, string text);
}

class EmailChannel : IChannel { public void Deliver(string to, string text) { /* SMTP */ } }
class SmsChannel : IChannel { public void Deliver(string to, string text) { /* SMS-шлюз */ } }

// Сторона 2: ЩО надіслати («абстракція»). Вона МІСТИТЬ канал: це посилання і є місток
abstract class Notification
{
    protected readonly IChannel channel;
    protected Notification(IChannel channel) { this.channel = channel; }
    public abstract void Send(string to);
}

class Alert : Notification
{
    public Alert(IChannel channel) : base(channel) { }
    public override void Send(string to) { channel.Deliver(to, "ALERT: server is down"); }
}

class Reminder : Notification
{
    public Reminder(IChannel channel) : base(channel) { }
    public override void Send(string to) { channel.Deliver(to, "Reminder: meeting at 10:00"); }
}

new Alert(new SmsChannel()).Send("+380...");
new Reminder(new EmailChannel()).Send("anna@example.com");
```

Тепер це 3 + 3 класи, і вони вільно комбінуються.

## Де ви вже це бачите

- Драйвери баз даних: ваш код говорить з ADO.NET (`DbConnection`, `DbCommand`), а драйвер для SQL Server чи PostgreSQL виконує справжню роботу.
- Логування: `ILogger` з одного боку, «приймачі» (консоль, файл, Application Insights) з іншого.

## Bridge, Strategy чи Adapter

Код схожий на Strategy (об'єкт містить інтерфейс), і це нормально. Різниться намір: **Bridge** закладають заздалегідь, щоб дві ієрархії росли незалежно; **Strategy** підміняє один алгоритм; **Adapter** додають згодом, щоб узгодити наявні речі.

## Запам'ятайте

Коли бачите, як множаться класи з назвами «*Що*×*Як*» (`EmailAlert`, `SmsAlert`...), розділіть два виміри й з'єднайте їх посиланням.
