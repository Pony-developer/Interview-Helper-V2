**Простими словами:** замість того щоб будувати новий об'єкт з нуля, ви **копіюєте наявний** (прототип) і змінюєте те, що відрізняється.

## Картинка з життя

Потрібен договір із новим клієнтом. Ніхто не пише його з чистого аркуша: беруть останній підписаний договір, роблять копію й змінюють назву, дати й ціну.

## Проблема

Створення об'єкта може бути дорогим (він завантажує дані, виконує обчислення) або марудним (десятки налаштувань). Якщо потрібно багато схожих об'єктів, дешевше ретельно налаштувати один і клонувати його.

## На C#

```csharp
class EmailTemplate
{
    public string Subject;
    public string Body;
    public List<string> Attachments = new List<string>();

    // Поверхнева копія: поля скопійовано, але Attachments — ТОЙ САМИЙ список в обох об'єктах
    public EmailTemplate ShallowCopy() { return (EmailTemplate)MemberwiseClone(); }

    // Глибока копія: вкладені об'єкти теж копіюються
    public EmailTemplate DeepCopy()
    {
        var copy = (EmailTemplate)MemberwiseClone();
        copy.Attachments = new List<string>(Attachments);
        return copy;
    }
}

var welcome = new EmailTemplate { Subject = "Welcome!", Body = "..." };
welcome.Attachments.Add("guide.pdf");

var vipWelcome = welcome.DeepCopy();
vipWelcome.Subject = "Welcome, VIP!";
vipWelcome.Attachments.Add("vip-offer.pdf");   // в оригіналі й далі лише guide.pdf
```

## Пастка: поверхнева та глибока копія

`MemberwiseClone()` копіює поля по одному. Для `string` чи `int` це гаразд. Для `List` чи іншого об'єкта копіюється лише **посилання**, тож клон і оригінал його ділять. Змініть список в одному — він зміниться й в іншому. Це найчастіша помилка з Prototype і улюблене питання на співбесідах.

## Де ви вже це бачите

- `ICloneable` у .NET (його рідко радять, бо він не каже, глибока копія чи поверхнева).
- Типи `record` у сучасному C#: `var copy = original with { Subject = "New" };` створює копію з однією зміною.
- У Dynamics: копіювання наявного запису як шаблону для нового.

## Запам'ятайте

Prototype = «скопіюй і підправ». Завжди питайте себе: *чи потрібні копії власні вкладені об'єкти?* Якщо так, робіть глибоку копію.
