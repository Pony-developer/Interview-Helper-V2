**Простими словами:** Visitor дає змогу **додавати нові операції до групи класів, не редагуючи ці класи**. Операція живе в окремому класі-«відвідувачі», що має по одному методу на кожен вид об'єкта.

## Картинка з життя

Податковий інспектор відвідує різні підприємства: магазин, ресторан, завод. Підприємства не змінюються; інспектор знає, як перевіряти кожен вид. Наступного місяця ті самі підприємства відвідує пожежний інспектор з іншими перевірками, а підприємства знову не змінюються.

## Проблема

Документ складається з `Paragraph`, `Image` і `Table`. Сьогодні потрібен «експорт у HTML», завтра «експорт у PDF», потім «підрахунок слів». Щоразу додавати метод у кожен клас означає розкидати одну функцію по багатьох файлах і напхати класи непов'язаним кодом.

## На C#

```csharp
interface IVisitor
{
    void Visit(Paragraph p);
    void Visit(Image i);
}

abstract class Element
{
    public abstract void Accept(IVisitor visitor);
}

class Paragraph : Element
{
    public string Text;
    public override void Accept(IVisitor visitor) { visitor.Visit(this); }   // "this" вибирає потрібне перевантаження
}

class Image : Element
{
    public string Url;
    public override void Accept(IVisitor visitor) { visitor.Visit(this); }
}

// Нова операція = новий відвідувач. Класи елементів не змінюються
class HtmlExporter : IVisitor
{
    public readonly StringBuilder Html = new StringBuilder();
    public void Visit(Paragraph p) { Html.Append("<p>" + p.Text + "</p>"); }
    public void Visit(Image i) { Html.Append("<img src=\"" + i.Url + "\">"); }
}

var exporter = new HtmlExporter();
foreach (var element in document) element.Accept(exporter);
```

Хитрість у **подвійній диспетчеризації**: `Accept` вибирається за типом елемента, а всередині нього `visitor.Visit(this)` — за типом відвідувача.

## Компроміс

| Додати... | З Visitor |
| --- | --- |
| нову **операцію** | легко: один новий клас-відвідувач |
| новий **вид елемента** | важко: кожному відвідувачу потрібен новий метод |

Тож Visitor пасує, коли набір типів **стабільний**, а операцій стає дедалі більше.

## Де ви вже це бачите

- `CSharpSyntaxVisitor` у Roslyn і `ExpressionVisitor` для дерев виразів LINQ: компілятори та аналізатори обходять синтаксичні дерева відвідувачами.
- У сучасному C# `switch` із шаблонами типів (`case Paragraph p:`) часто є легшою альтернативою.

## Запам'ятайте

Visitor = «**нові операції, не чіпаючи класів**», ціною того, що нові класи стають дорогими. Це найрідший патерн GoF у щоденному коді; знати, коли його *не* застосовувати, — теж частина відповіді.
