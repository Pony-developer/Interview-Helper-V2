**Простими словами:** фасад — це **одні прості вхідні двері до складної системи**. За ними може бути десять класів; той, хто викликає, бачить один метод.

## Картинка з життя

Рецепція готелю. Щоб отримати номер, таксі й столик на вечерю, ви не дзвоните самі в службу прибирання, на паркування й до ресторану. Ви говорите з адміністратором, який усе координує за лаштунками.

## Проблема

Оформлення замовлення зачіпає багато частин: перевірити склад, зарезервувати товар, списати гроші з картки, створити доставку, надіслати лист. Якщо кожен контролер, плагін і фонове завдання викликають усі п'ять сервісів у правильному порядку, логіку замовлення скопійовано всюди, і кожну копію доведеться виправляти, коли процес зміниться.

## На C#

```csharp
class OrderFacade
{
    private readonly Inventory inventory;
    private readonly PaymentGateway payments;
    private readonly DeliveryService delivery;
    private readonly EmailSender email;

    public OrderFacade(Inventory inventory, PaymentGateway payments, DeliveryService delivery, EmailSender email)
    {
        this.inventory = inventory; this.payments = payments; this.delivery = delivery; this.email = email;
    }

    // Один простий метод приховує весь процес
    public void PlaceOrder(Cart cart, Customer customer)
    {
        inventory.Reserve(cart.Items);
        payments.Charge(customer.Card, cart.Total);
        var trackingNumber = delivery.Schedule(cart.Items, customer.Address);
        email.Send(customer.Email, "Your order is on its way: " + trackingNumber);
    }
}
```

## Де ви вже це бачите

- `File.ReadAllText(path)` приховує відкриття потоку, вибір кодування, читання й закриття.
- `HttpClient.GetStringAsync(url)` приховує сокети, заголовки й розбір відповіді.
- «Сервісний шар» у бекенді: `CustomerService.Register(...)` сам викликає репозиторії, перевірки та лист.

## Коли застосовувати, а коли ні

- **Пасує:** клієнтам потрібен простий спосіб зробити типову дію зі складною підсистемою.
- **Обережно:** фасад, що росте, поки не почне робити все, стає **God object** (божественним об'єктом). Це вхідні двері, а не вся будівля. Класами підсистеми все одно має бути можна користуватися напряму, коли комусь потрібен точний контроль.

## Запам'ятайте

Facade **спрощує**: він не додає нової поведінки, а лише дає коротку й безпечну дорогу крізь щось складне.
