Зберіть створення сповіщувачів в **одній фабриці**.

У програмі вже є три класи за одним інтерфейсом `INotifier`:

- `EmailNotifier`: «Email to anna: ...»;
- `SmsNotifier`: обрізає довгі тексти до 20 символів;
- `TeamsNotifier`: «Teams message to @anna: ...».

Напишіть `NotifierFactory.Create(channel)`:

- `"email"` повертає `EmailNotifier`, `"sms"` — `SmsNotifier`, `"teams"` — `TeamsNotifier`;
- назва каналу **не залежить від регістру**: `"SMS"` і `"sms"` — той самий канал;
- будь-який інший канал кидає `ArgumentException` з повідомленням `Unknown channel: <channel>`.

Не змінюйте `Main`: зверніть увагу, що він знає лише про `INotifier` і ніде не згадує конкретного класу. У цьому й сенс фабрики. Очікуваний вивід:

```text
Email to anna: Your order #42 has been shipped
SMS to anna: Your order #42 has b...
Teams message to @anna: Your order #42 has been shipped
Error: Unknown channel: fax
```

Підказка: `switch (channel.ToLowerInvariant())` з одним `case` на канал і `default: throw new ArgumentException(...)`.
