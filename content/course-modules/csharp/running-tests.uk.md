Покрокове керівництво зі створення проєкту з тестами та запуску їх на вашому комп'ютері. Вам потрібен **.NET SDK** (версії 6 або новішої); перевірте його через `dotnet --version`.

> Онлайн-запускач цього курсу не може виконати ці кроки, тож робіть їх на своєму комп'ютері в терміналі.

## 1. Створіть проєкти

```text
dotnet new sln -n Shop
dotnet new classlib -n Shop.Core
dotnet new xunit -n Shop.Tests
dotnet sln add Shop.Core Shop.Tests
dotnet add Shop.Tests reference Shop.Core
```

Що робить кожен рядок:

1. створює файл рішення `Shop.sln`, контейнер для проєктів;
2. створює бібліотеку класів `Shop.Core`, тобто код, який тестуватимуть;
3. створює тестовий проєкт `Shop.Tests` із уже налаштованим xUnit;
4. додає обидва проєкти до рішення;
5. дає тестам змогу бачити код: додає **посилання** з `Shop.Tests` на `Shop.Core`.

## 2. Напишіть трохи коду

Видаліть згенерований `Class1.cs` у `Shop.Core` і додайте `Calculator.cs`:

```csharp
namespace Shop.Core;

public static class Calculator
{
    public static int Add(int a, int b) => a + b;

    public static int Divide(int a, int b) => a / b;
}
```

Зверніть увагу на `public`: тестовий проєкт — це інша збірка, і вона бачить лише публічне.

## 3. Напишіть тести

Перейменуйте `UnitTest1.cs` у `Shop.Tests` на `CalculatorTests.cs`:

```csharp
using Shop.Core;
using Xunit;

namespace Shop.Tests;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        Assert.Equal(5, Calculator.Add(2, 3));
    }

    [Theory]
    [InlineData(1, 1, 2)]
    [InlineData(-1, 1, 0)]
    [InlineData(0, 0, 0)]
    public void Add_Various_ReturnsExpected(int a, int b, int expected)
    {
        Assert.Equal(expected, Calculator.Add(a, b));
    }

    [Fact]
    public void Divide_ByZero_Throws()
    {
        Assert.Throws<DivideByZeroException>(() => Calculator.Divide(1, 0));
    }
}
```

## 4. Запустіть їх

З теки, де лежить `Shop.sln`:

```text
dotnet test
```

Інструмент збирає рішення, знаходить тести й запускає їх. Успішний запуск завершується підсумком на кшталт:

```text
Passed!  - Failed:     0, Passed:     5, Skipped:     0, Total:     5
```

П'ять тестів: один `[Fact]`, три випадки `[InlineData]` і ще один `[Fact]`.

## 5. Прочитайте збій

Змініть `Add` на `a - b` і запустіть знову:

```text
  Failed Shop.Tests.CalculatorTests.Add_TwoNumbers_ReturnsSum [12 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 5
Actual:   -1
  Stack Trace:
     at Shop.Tests.CalculatorTests.Add_TwoNumbers_ReturnsSum() in ...CalculatorTests.cs:line 12
```

Читайте згори:

1. **Який тест** провалився: повне ім'я каже вам клас і сценарій.
2. **Очікуване та фактичне**: що ви хотіли і що дав код.
3. **Рядок** у тесті, де не спрацювала перевірка. Звідти переходьте до коду, що тестується.

Потім виправте код (а не тест, якщо тест не був хибним) і запустіть знову.

## 6. Корисні параметри

```text
dotnet test --filter "FullyQualifiedName~Divide"     # лише тести, у назві яких є Divide
dotnet test --filter "DisplayName~ByZero"            # за відображуваним ім'ям
dotnet test --no-build                               # пропустити крок збірки
dotnet test --logger "console;verbosity=detailed"    # назва кожного тесту
dotnet test --collect:"XPlat Code Coverage"          # зібрати дані про покриття
dotnet watch test                                    # перезапускати за кожної зміни файлу
```

`dotnet watch test` чудово підходить для циклу «червоний-зелений»: збережіть файл, і результат з'явиться в терміналі.

## 7. Запуск тестів у редакторі

**Visual Studio**: відкрийте рішення й оберіть **Test > Test Explorer**. Можна запустити всі тести (`Ctrl+R, A`), тести одного класу, лише ті, що провалилися, та **налагоджувати** окремий тест: клацніть його правою кнопкою й оберіть *Debug*, поставивши точку зупину, як ви навчилися в лекції про налагодження.

**Visual Studio Code**: встановіть **C# Dev Kit**. Подання **Testing** (іконка колби) перелічує тести, а біля кожного тестового методу в редакторі з'являються маленькі іконки запуску й налагодження.

**JetBrains Rider**: зелені іконки на полях біля кожного тесту й класу та вікно *Unit Tests*.

## 8. Поширені проблеми

| Симптом | Імовірна причина |
| --- | --- |
| «No test is available» | метод не публічний, не має `[Fact]`/`[Test]` або бракує пакета тестового SDK |
| `The type or namespace name 'Calculator' could not be found` | немає посилання на проєкт `Shop.Core`, бракує `using` або клас не `public` |
| тест проходить окремо й падає разом з іншими | тести ділять якийсь стан: зробіть їх незалежними |
| падає лише на іншому комп'ютері чи в CI | прихований вхід: час, культура, шлях, змінна середовища |
| збірка падає з помилками «target framework» | проєкти використовують несумісні версії .NET: перевірте `TargetFramework` у файлах `.csproj` |
| старі результати після зміни | збірка застаріла: виконайте `dotnet clean`, а потім `dotnet test` |

## 9. Добрий цикл

1. Напишіть тест, що падає. Запустіть і побачте **червоний**.
2. Напишіть найпростіший код, що змушує його пройти. Запустіть і побачте **зелений**.
3. Наведіть лад і знову запустіть усі тести.
4. Зробіть коміт.

Короткі цикли, запущені часто: ось що робить тести допомогою, а не повинністю.
