## Завдання

Реалізуйте **`RuleLoader.Discover(assembly)`** — ядро системи плагінів: знайти всі правила знижок у збірці через рефлексію.

Тип є правилом, коли він:

- **клас**, що не є **абстрактним** (`BaseRule` треба пропустити: створити його екземпляр не можна);
- приводиться до **`IDiscountRule`** (`typeof(IDiscountRule).IsAssignableFrom(t)`);
- позначений **`[Rule(order)]`** (`Unordered` реалізує інтерфейс, але не має атрибута, тож ігнорується).

Створіть екземпляр кожного через `Activator.CreateInstance` і поверніть їх, відсортувавши за `Order` атрибута.

Кінець `Main` показує виклик методу через рефлексію: `MethodInfo.Invoke` з `object[]` аргументів повертає запакований результат.

Очікуваний результат:

```
MinusFive -> TenPercentOff -> RoundDown
MinusFive: 115
TenPercentOff: 103.5
RoundDown: 103
Decimal 180.0
```
