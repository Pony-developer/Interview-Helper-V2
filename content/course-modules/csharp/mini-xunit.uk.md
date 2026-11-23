Програма вже містить крихітний тестовий фреймворк (`[Fact]`, `[Theory]`, `[InlineData]` і `Assert.Equal`, що кидає `AssertException`) і тестовий клас `CartTests`. Бракує **запускача**. Напишіть `Run(Type testClass)`, що працює так, як xUnit:

- Знайдіть публічні методи класу (`testClass.GetMethods()`) і перебирайте їх **відсортованими за назвою** через `StringComparer.Ordinal`. Методи без тестового атрибута — не тести.
- Метод із `[Fact]`, у якого задано `Skip`, не виконується: виведіть `SKIP <назва>: <причина>`.
- Будь-який інший `[Fact]` — один тест із назвою `<назва>`.
- `[Theory]` дає по тесту на кожен `[InlineData]` (`method.GetCustomAttributes<InlineDataAttribute>()`). Його назва — `<назва>(<аргументи>)`, де аргументи з'єднано через `", "`, а аргументи — це `Data`. Рефлексія не обіцяє жодного порядку атрибутів, тож виконуйте випадки **відсортованими за їхніми назвами** (теж ordinal).
- Виконуйте кожен тест на **новому екземплярі** класу (`Activator.CreateInstance`), викликайте метод через `method.Invoke(instance, args)`, а після цього викликайте `Dispose`, якщо екземпляр є `IDisposable`, навіть коли тест упав.
- Тест, що завершився нормально, виводить `PASS <назва>`. Якщо він кидає виняток, `Invoke` загортає його в `TargetInvocationException`; справжній лежить у `InnerException`. Для `AssertException` виведіть `FAIL <назва>: <повідомлення>`, для будь-якого іншого винятку — `FAIL <назва>: <ТипВинятку>: <повідомлення>`.
- Наприкінці виведіть `Passed: P, failed: F, skipped: S`.

Не змінюйте тести й `Main`. Очікуваний вивід:

```text
PASS AddOne_CountIsOne
PASS AddTwo_CountIsTwo
PASS Add_ReturnsSum(-1, 1, 0)
FAIL Add_ReturnsSum(2, 2, 5): expected 5, but was 4
PASS Add_ReturnsSum(2, 3, 5)
SKIP Discount_IsApplied: discounts are not ready
FAIL First_OfEmptyCart: InvalidOperationException: the cart is empty
FAIL Total_IsWrong: expected 4, but was 5
Passed: 4, failed: 3, skipped: 1
Instances created: 7, disposed: 7
```

Зверніть увагу на `AddTwo_CountIsTwo`: він проходить лише тому, що отримує власний порожній кошик. Зі спільним екземпляром він побачив би яблуко з попереднього тесту і впав би.

Підказка: `method.GetCustomAttribute<FactAttribute>()` повертає `null`, коли методу бракує такого атрибута. Помічник `RunOne(testClass, method, args)`, що повертає `null` при успіху, а інакше — текст падіння, робить `Run` коротким.
