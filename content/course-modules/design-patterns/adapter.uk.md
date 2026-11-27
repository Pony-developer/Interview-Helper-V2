**Простими словами:** адаптер — це **перекладач між двома інтерфейсами**, які не пасують один до одного. Ваш код і далі говорить своєю мовою, а адаптер перекладає кожен виклик мовою іншої сторони.

## Картинка з життя

Дорожній перехідник для розетки. У ноутбука європейська вилка, а в лондонському готелі британські розетки. Ви не переробляєте ні ноутбук, ні стіну: ви вставляєте перехідник посередині.

## Проблема

Код магазину працює з `IPayment.Pay(decimal amount)`. SDK нового провайдера, який ви не можете змінити, пропонує `Charge(long cents, string currencyCode)`. Правити кожне місце оплати, щоб воно викликало новий SDK, означає розкидати подробиці провайдера по всьому коду.

## На C#

```csharp
// Що очікує наш код
interface IPayment
{
    bool Pay(decimal amount);
}

// Чужий SDK: змінити його ми не можемо
class StripeLikeClient
{
    public string Charge(long cents, string currencyCode) { /* ... */ return "succeeded"; }
}

// Адаптер: реалізує НАШ інтерфейс і викликає ЇХНІЙ API
class StripeLikePaymentAdapter : IPayment
{
    private readonly StripeLikeClient client;

    public StripeLikePaymentAdapter(StripeLikeClient client) { this.client = client; }

    public bool Pay(decimal amount)
    {
        var status = client.Charge((long)(amount * 100), "UAH");
        return status == "succeeded";
    }
}

IPayment payment = new StripeLikePaymentAdapter(new StripeLikeClient());
payment.Pay(199.99m);
```

## Де ви вже це бачите

- Обгортання старого SOAP- чи legacy-сервісу чистим інтерфейсом для нового коду.
- В інтеграціях: перетворення JSON зовнішньої системи на власні сутності (наприклад, на об'єкти `Entity` у Dataverse).
- `StreamReader` адаптує байтовий `Stream` до чогось, що читає текст.

## Коли застосовувати, а коли ні

- **Пасує:** треба користуватися класом із «неправильним» інтерфейсом, який ви не можете (або не повинні) змінювати: сторонні SDK, legacy-код.
- **Зайве:** обидві сторони ваші, тож просто зробіть їх сумісними.

## Запам'ятайте

Adapter **змінює інтерфейс**, щоб дві наявні речі могли працювати разом. (А от Decorator і Proxy зберігають той самий інтерфейс.)
