## Завдання

Завершіть ієрархію фігур.

- **`Circle(double radius)`** зберігає радіус; його `Area` дорівнює π·r².
- **`Rectangle(double width, double height)`** зберігає обидві сторони й передає базовому класу назву `"Rectangle"`; його `Area` — ширина × висота.
- **`Square(double side)`** — це `Rectangle` з рівними сторонами, але його `Name` має бути `"Square"`.

Складність: `Square` не може передати власну назву через публічний конструктор `Rectangle(width, height)`. Додайте **`protected`**-конструктор `Rectangle(string name, double width, double height)`, нехай публічний викликає його через `: this(...)`, а `Square` — через `: base(...)`.

`Describe()` і `ToString()` уже написані в `Shape`; не змінюйте їх.

Очікуваний результат:

```
Circle with area 3.14
Rectangle with area 7.00
Square with area 16.00
Total: 26.14
Square 3x3 is Rectangle: True
```
