Допишіть **замовлення, що змінює свій стан**.

Базовий клас `OrderState` за замовчуванням відмовляє в кожній дії: друкує `  Cannot <дія> an order that is <стан>` і повертає `this` (стан не змінюється). Кожен стан перевизначає лише дозволені дії й **повертає наступний стан**. `NewState`, `ShippedState` і `CancelledState` готові. `Order` лише питає поточний стан і запам'ятовує те, що той повернув.

Допишіть `PaidState`. Оплачене замовлення:

- можна **відправити**: надрукувати `  Parcel handed to the courier` і перейти в `ShippedState`;
- можна **скасувати**: надрукувати `  Money refunded` і перейти в `CancelledState`;
- не можна оплатити вдруге (це вже робить базовий клас).

Не змінюйте нічого поза `PaidState`. Очікуваний вивід:

```text
ship (New)
  Cannot ship an order that is New
pay (New)
  Payment received
pay (Paid)
  Cannot pay an order that is Paid
ship (Paid)
  Parcel handed to the courier
cancel (Shipped)
  Cannot cancel an order that is Shipped
First order: Shipped
pay (New)
  Payment received
cancel (Paid)
  Money refunded
ship (Cancelled)
  Cannot ship an order that is Cancelled
Second order: Cancelled
```

Зверніть увагу: у програмі немає жодного `if (status == ...)`: кожне правило живе в класі того стану, до якого належить.

Підказка: `public override OrderState Ship() { ...; return new ShippedState(); }`, і так само для `Cancel`.
