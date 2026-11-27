## Завдання

Одна невелика модель, що зачіпає більшість питань 36–42: абстрактний клас із шаблонним методом, інтерфейс, `const` і `readonly`, `override` і `new`.

Допишіть чотири тіла методів:

1. **`PaymentMethod.Pay(amount)`** — якщо `amount <= 0` або `amount > MaxAmount`, поверніть `"<Describe()>: rejected"`. Інакше поверніть `"<Describe()>: <total>"`, де `total = amount + Fee(amount)` у форматі `"0.00"` з `CultureInfo.InvariantCulture`. Це **шаблонний метод**: алгоритм зафіксовано в базовому класі, а комісія — крок, який надають похідні класи.
2. **`Card.Fee`** — 2% від суми.
3. **`Card.Refund`** — сума мінус 1.00 за обробку, але не менше 0.
4. **`Transfer.Fee`** — фіксовані 5.00.

Потім подивіться на вивід і поясніть його: `Transfer.Describe()` оголошено з **`new`**, тож він *приховує* базовий метод, а не перевизначає його. Усередині `Pay` (і через змінну типу `PaymentMethod`) виконується базовий `Describe()` — `"payment by Bob"`; лише змінна типу `Transfer` бачить `"bank transfer of Bob"`. `Card` перевизначає метод, тож усюди виходить `"card of Ann"`. `IRefundable` реалізує лише `Card`, що й показує перевірка через `as`.

Очікуваний вивід:

```
card of Ann: 102.00
card of Ann: rejected
card of Ann: rejected
payment by Bob: 105.00
payment by Bob: rejected
payment by Bob: rejected
card of Ann refunds 99.00
payment by Bob cannot refund
bank transfer of Bob
1000
```
