**Простими словами:** будівельник дає змогу **складати складний об'єкт крок за кроком**, задаючи лише потрібні частини, і наприкінці отримати готовий об'єкт.

## Картинка з життя

Замовлення бургера там, де його збирають самі: булка, потім котлета, потім сир (або без), соус, більше огірків. Ви додаєте частини по одній, а наприкінці кажете «все» й отримуєте бургер.

## Проблема

```csharp
var report = new Report("Sales", null, null, true, false, 50, "Date", true, null);
```

Що означає `true, false, 50`? Який `null` за що відповідає? Конструктори з купою необов'язкових параметрів важко читати й легко переплутати («телескопічний конструктор»).

## На C#

```csharp
class ReportBuilder
{
    private readonly Report report = new Report();

    public ReportBuilder Title(string title) { report.Title = title; return this; }
    public ReportBuilder AddColumn(string name) { report.Columns.Add(name); return this; }
    public ReportBuilder SortBy(string column) { report.SortColumn = column; return this; }
    public ReportBuilder Top(int rows) { report.MaxRows = rows; return this; }

    public Report Build()
    {
        if (report.Columns.Count == 0) throw new InvalidOperationException("A report needs columns");
        return report;
    }
}

var report = new ReportBuilder()
    .Title("Sales")
    .AddColumn("Customer").AddColumn("Amount")
    .SortBy("Amount")
    .Top(50)
    .Build();
```

Кожен метод повертає `this`, тож виклики складаються в читабельне речення (**fluent-інтерфейс**). `Build()` — місце, щоб перевірити, що об'єкт повний.

## Де ви вже це бачите

- `StringBuilder`: додаємо шматки, потім `ToString()`.
- `WebApplication.CreateBuilder(args)` в ASP.NET Core: налаштовуємо сервіси, потім `builder.Build()`.
- Будівельники тестових даних: `new AccountBuilder().WithName("Acme").Inactive().Build()` робить тести короткими.
- Будівельники запитів: `QueryExpression` у Dynamics, ланцюжки LINQ.

## Коли застосовувати, а коли ні

- **Пасує:** багато необов'язкових частин, суворий порядок складання або перевірка, перш ніж об'єкт буде готовий.
- **Зайве:** об'єкт із двома-трьома полями. Ініціалізаторів об'єктів C# (`new Report { Title = "Sales" }`) чи іменованих аргументів досить.

## Запам'ятайте

Builder = «будуємо крок за кроком, завершуємо `Build()`». Він бореться з нечитабельними конструкторами та напівготовими об'єктами.
