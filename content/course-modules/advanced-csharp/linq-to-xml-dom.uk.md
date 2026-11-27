## X-DOM

LINQ to XML (`System.Xml.Linq`) — об'єктна модель XML у пам'яті, створена, щоб її **будували й запитували через LINQ**. Її ключові типи:

| Тип | Подає |
| --- | --- |
| `XDocument` | увесь документ: необов'язкове оголошення, кореневий елемент, коментарі, інструкції обробки |
| `XElement` | елемент: назва, атрибути, дочірні вузли |
| `XAttribute` | пара назва/значення на елементі (не вузол) |
| `XText`, `XCData`, `XComment` | вузли тексту, CDATA та коментарів |
| `XName`, `XNamespace` | назви, за потреби з простором імен |

`XElement` — робоча конячка: `XDocument` рідко потрібен, хіба що вам важливі оголошення XML чи коментарі верхнього рівня.

## Завантаження та збереження

```csharp
XElement config = XElement.Parse("<config><timeout>30</timeout></config>");
XDocument doc = XDocument.Load("orders.xml");        // файл, потік, TextReader або XmlReader
doc.Save("copy.xml");
string text = config.ToString();                      // з відступами
string compact = config.ToString(SaveOptions.DisableFormatting);
```

## Функціональна побудова

Будуйте дерева одним виразом через вкладені конструктори. Аргументи-вміст можуть бути іншими елементами, атрибутами, рядками, числами, `null` (ігнорується) або **послідовностями** з них, тож LINQ-запити вставляються напряму:

```csharp
var xml = new XElement("orders",
    new XAttribute("generated", DateTime.UtcNow),
    from o in orders
    where o.Total > 0
    select new XElement("order",
        new XAttribute("id", o.Id),
        new XElement("customer", o.Customer),
        new XElement("total", o.Total),
        o.Note == null ? null : new XElement("note", o.Note)));   // необов'язковий елемент
```

Значення форматуються за правилами XML (`XmlConvert`), тож дати стають ISO 8601, а десяткові використовують крапку незалежно від культури.

## Автоматичне глибоке клонування

Вузол може мати лише одного батька. Додавання вузла, що вже має батька, до іншого дерева автоматично його **клонує**:

```csharp
var a = new XElement("a", new XElement("child"));
var b = new XElement("b", a.Element("child"));   // b отримує копію; a зберігає свій дочірній елемент
```

## Проєкція об'єктів у XML і назад

```csharp
// об'єкт → XML
XElement ToXml(Customer c) => new("customer", new XAttribute("id", c.Id), new XElement("name", c.Name));

// XML → об'єкт, з безпечними перетвореннями
Customer FromXml(XElement e) => new Customer
{
    Id = (int)e.Attribute("id"),
    Name = (string)e.Element("name") ?? "",
    Discount = (decimal?)e.Element("discount") ?? 0m,   // елемента немає → null → 0
};
```

Явні перетворення (`(int)`, `(decimal?)`, `(DateTime)`, `(bool)`, `(string)`) на `XElement`/`XAttribute` розбирають за правилами XML. Nullable-версії повертають `null`, коли вузла немає, замість винятку.

## X-DOM проти старого XmlDocument

`System.Xml.XmlDocument` (W3C DOM) досі існує. LINQ to XML простіший (без фабричних об'єктів, без `XmlNamespaceManager` для запитів), дружній до LINQ і легший. `XmlDocument` беріть лише тоді, коли його вимагає наявний API, чи для старого коду з великою кількістю XPath (хоча розширення `System.Xml.XPath` працюють і з X-DOM).

## Що сказати на співбесіді

- `XElement`/`XAttribute`/`XDocument` утворюють XML DOM, зручний для LINQ.
- Функціональна побудова створює цілі дерева одним виразом із запитами всередині.
- Щоб читати значення безпечно щодо культури, використовуйте явні перетворення (`(decimal?)el`).
