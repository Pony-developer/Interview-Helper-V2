## Будівельні блоки

```csharp
public abstract class Document
{
    public string Title { get; }
    protected Document(string title) => Title = title;

    public abstract int PageCount { get; }               // мусить бути перевизначений
    public virtual string Summary() => $"{Title}: {PageCount} pages";   // можна перевизначити
}

public class Report : Document
{
    private readonly int _pages;
    public Report(string title, int pages) : base(title) => _pages = pages;
    public override int PageCount => _pages;
    public override string Summary() => "[Report] " + base.Summary();   // повторне використання базової логіки
}

public sealed class Invoice : Report { /* від Invoice ніхто не може наслідуватися */ }
```

- `abstract`-клас: не можна створити екземпляр; може містити абстрактні члени без тіла.
- `virtual`: реалізація за замовчуванням, яку похідні класи можуть `override`.
- `sealed` на класі забороняє наслідування; `sealed override` забороняє подальше перевизначення одного члена.
- `base.Member()` викликає перевизначену версію; `: base(args)` обирає базовий конструктор.

## Поліморфізм і приведення типів

Змінна базового типу може містити будь-який похідний об'єкт; виклики віртуальних членів ідуть до типу **під час виконання**.

```csharp
Document d = new Report("Q3", 12);
Console.WriteLine(d.Summary());       // [Report] Q3: 12 pages

if (d is Report r) Console.WriteLine(r.PageCount);   // патерн типу: перевірка + приведення за крок
var maybe = d as Invoice;              // null, якщо це не Invoice; ніколи не кидає
var forced = (Invoice)d;               // InvalidCastException, якщо це не Invoice
```

**Висхідне приведення** (похідний → базовий) неявне і завжди безпечне. **Низхідне** (базовий → похідний) явне і перевіряється під час виконання.

## override проти new (приховування)

```csharp
class A { public virtual string Who() => "A"; }
class B : A { public override string Who() => "B"; }
class C : A { public new string Who() => "C"; }

A b = new B(); Console.WriteLine(b.Who());   // B  (override: перемагає тип під час виконання)
A c = new C(); Console.WriteLine(c.Who());   // A  (new: перемагає тип під час компіляції)
```

`new` ламає поліморфізм: який метод виконається, залежить від оголошеного типу змінної. Майже ніколи вам цього не треба; компілятор попереджає про випадкове приховування.

## Коваріантні типи повернення (C# 9)

Перевизначення може повертати *більш похідний* тип, ніж базовий метод:

```csharp
class Animal { public virtual Animal Clone() => new Animal(); }
class Cat : Animal { public override Cat Clone() => new Cat(); }   // дозволено з C# 9
```

## Конструктори та успадкування

Конструктори **не успадковуються**. Похідний клас мусить визначити власні й викликати базовий (неявно — без параметрів, який тоді мусить існувати). Порядок виконання: ініціалізатори полів похідного → ініціалізатори полів базового → тіло базового конструктора → тіло похідного конструктора.

Не викликайте віртуальні методи з базового конструктора: перевизначення виконається раніше, ніж похідний конструктор ініціалізує свої поля.

## Вибір перевантаження з успадкуванням

Коли підходять кілька перевантажень, компілятор обирає найконкретніше за **статичним** типом аргументу, а не за типом під час виконання:

```csharp
void Show(Document d) => Console.WriteLine("document");
void Show(Report r)   => Console.WriteLine("report");
Document x = new Report("x", 1);
Show(x);   // "document": перевантаження обираються під час компіляції
```

## Що сказати на співбесіді

- `override` замінює поведінку для всіх викликачів; `new` лише приховує її для тих, хто працює через похідний тип.
- Перевантаження обираються під час компіляції; перевизначення диспетчеризуються під час виконання.
- Віддавайте перевагу композиції, коли класу потрібна лише поведінка іншого, а не його ідентичність.
