## Завдання

Питання 129: «Як би ви реалізували наскрізну функціональність: логування, валідацію чи транзакції?» Популярна відповідь у .NET — **конвеєр медіатора** (`IPipelineBehavior` у MediatR): кожен запит проходить ланцюжок behaviors, перш ніж дійти до обробника. Збудуйте його ядро.

Допишіть:

1. **`ValidationBehavior.Handle(request, next)`** — якщо `Amount <= 0`, киньте `ArgumentException("Amount must be positive")` **без виклику `next`**: обробник не виконається. Інакше поверніть `next()`.
2. **`Mediator.Send<TRequest, TResponse>(request)`**:
   - знайдіть обробник, зареєстрований для `typeof(TRequest)`, і приведіть його до `IHandler<TRequest, TResponse>`;
   - почніть з `Func<TResponse> next = () => handler.Handle(request);`
   - обгорніть його в кожен зареєстрований behavior типу `IBehavior<TRequest, TResponse>` (`behaviors.OfType<…>()` пропускає behaviors для інших типів запитів) так, щоб **перший зареєстрований behavior був найзовнішнім** — обгортайте у зворотному порядку. Усередині циклу захоплюйте поточні `next` і behavior у локальні змінні;
   - викличте отриманий делегат.

Стежте за виводом для некоректного замовлення: логування починається (`-> CreateOrder`), валідація зупиняє конвеєр, тож не виконуються ні обробник, ні рядок `<-`.

Очікуваний вивід:

```
-> CreateOrder
handle CreateOrder for ann
<- CreateOrder = 1
-> CreateOrder
rejected: Amount must be positive
-> CreateOrder
handle CreateOrder for bob
<- CreateOrder = 2
-> GetOrderCount
<- GetOrderCount = 2
```
