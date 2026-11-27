**Простими словами:** State дає змогу об'єкту **змінювати поведінку, коли змінюється його внутрішній стан**, ніби він став іншим об'єктом. Кожен стан — окремий клас, і стани самі вирішують, який стан буде наступним.

## Картинка з життя

Світлофор. Натискання кнопки для пішоходів робить різне залежно від того, зелений він, жовтий чи червоний. І світлофор сам знає, що після зеленого йде жовтий, а не червоний.

## Проблема

```csharp
void Ship()
{
    if (status == "New") Console.WriteLine("Pay first");
    else if (status == "Paid") { status = "Shipped"; ... }
    else if (status == "Shipped") Console.WriteLine("Already shipped");
    else if (status == "Cancelled") Console.WriteLine("Order is cancelled");
}
// ...і та сама драбина if-ів у Pay(), Cancel(), Refund()...
```

Кожен метод повторює той самий `if` за статусом. Додати статус «Повернено» означає знайти й виправити кожну драбину.

## На C#

```csharp
abstract class OrderState
{
    public abstract string Name { get; }

    // За замовчуванням дія заборонена: кожен стан перевизначає лише те, що дозволяє
    public virtual OrderState Pay() { Console.WriteLine("Cannot pay: order is " + Name); return this; }
    public virtual OrderState Ship() { Console.WriteLine("Cannot ship: order is " + Name); return this; }
}

class NewState : OrderState
{
    public override string Name { get { return "New"; } }
    public override OrderState Pay() { return new PaidState(); }     // New -> Paid
}

class PaidState : OrderState
{
    public override string Name { get { return "Paid"; } }
    public override OrderState Ship() { return new ShippedState(); } // Paid -> Shipped
}

class Order
{
    public OrderState State = new NewState();
    public void Pay() { State = State.Pay(); }
    public void Ship() { State = State.Ship(); }
}
```

Усі правила для «Paid» живуть у `PaidState`. Новий статус — новий клас.

## State проти Strategy

Діаграми класів майже однакові: об'єкт тримає інтерфейс і делегує йому. Різниця: у **Strategy** алгоритм вибирає *клієнт*, і він рідко змінюється; у **State** *стани перемикаються самі* в міру подій (`Pay()` повертає наступний стан).

## Де ви вже це бачите

- Життєві цикли замовлень і документів, стани з'єднання (підключається, відкрите, закрите), ігрові персонажі.
- **Dynamics 365:** `statecode` / `statuscode` у записах і business process flows з їхніми етапами. Плагіни часто перевіряють переходи «з якого статусу в який», а це і є скінченний автомат.

## Коли застосовувати, а коли ні

- **Пасує:** об'єкт має кілька станів, поведінка в них дуже різниться, і правила переходів важливі.
- **Зайве:** два стани й один `if`. Цілком вистачить `bool`. Для простих життєвих циклів може вистачити й таблиці переходів (словника «з, дія -> в»).

## Запам'ятайте

State = «**кожен стан — клас, що знає, що він дозволяє і що буде далі**». Він замінює драбини `if (status == ...)`.
