## Навігація

```csharp
XElement root = XElement.Load("shop.xml");

root.Element("customers");                 // перший прямий нащадок із такою назвою (або null)
root.Elements("order");                    // усі прямі нащадки з назвою "order"
root.Descendants("line");                  // усі відповідні елементи на будь-якій глибині
root.Attribute("version");                 // атрибут (або null)
el.Parent; el.Ancestors(); el.ElementsAfterSelf(); el.NextNode;
root.Nodes();                              // усі дочірні вузли, включно з текстом і коментарями
```

Кожен метод повертає `IEnumerable<...>`, тож запити пишуться звичайним LINQ:

```csharp
var bigOrders =
    from o in root.Descendants("order")
    let total = (decimal)o.Element("total")
    where total > 100
    orderby total descending
    select new { Id = (int)o.Attribute("id"), Total = total };
```

`Element(...)`, що повертає null, — головне джерело помилок: ланцюжок `.Element("a").Element("b").Value` кидає виняток, якщо `a` немає. Віддавайте перевагу явним перетворенням у nullable-типи або `?.`.

## Оновлення

```csharp
var order = root.Element("order");
order.SetElementValue("status", "shipped");      // оновити, додати, якщо немає, видалити, якщо значення null
order.SetAttributeValue("updated", DateTime.UtcNow);
order.Add(new XElement("note", "fragile"));
order.AddFirst(new XComment("checked"));
order.Element("legacy")?.Remove();
order.ReplaceNodes(new XElement("empty"));
root.Descendants("draft").Remove();              // видалити всі відповідні елементи (розширення на послідовності)
```

`el.Value` читає чи задає склеєний текст елемента й усіх його нащадків. Присвоєння замінює всі дочірні вузли одним текстовим.

## Робота зі значеннями

- **Змішаний вміст**: `<p>Hello <b>world</b>!</p>` містить вузли тексту, елемента й тексту; `p.Value` дорівнює `"Hello world!"`.
- **Пробіли** ігноруються при завантаженні, якщо не передати `LoadOptions.PreserveWhitespace`.
- Спецсимволи екрануються автоматично під час виводу: `&amp;` самі ви ніколи не пишете.

## Назви та простори імен

XML-назва — це простір імен плюс локальна назва. У LINQ to XML їх поєднує `XName`:

```csharp
XNamespace ns = "urn:shop:v2";
var el = new XElement(ns + "order",
    new XAttribute(XNamespace.Xmlns + "s", ns),   // обрати префікс "s" для виводу
    new XElement(ns + "id", 42));
// <s:order xmlns:s="urn:shop:v2"><s:id>42</s:id></s:order>

var orders = doc.Descendants(ns + "order");      // запити теж мають використовувати простір імен
```

**Простір імен за замовчуванням** (`xmlns="..."`) застосовується до елементів, але **не** до атрибутів; атрибути без префікса не мають простору імен. Забутий простір імен у запиті — класична помилка «мій запит нічого не повертає» із SOAP, RSS/Atom та Office XML.

## Анотації

`el.AddAnnotation(obj)` прикріплює до вузла приватні дані, що не серіалізуються (наприклад, номер рядка чи зв'язок з доменним об'єктом). Отримати: `el.Annotation<T>()`.

## Що сказати на співбесіді

- `Elements` = прямі нащадки; `Descendants` = будь-яка глибина; обидва повертають послідовності для LINQ.
- `SetElementValue`/`SetAttributeValue` оновлюють, додають чи видаляють одним викликом.
- XML із просторами імен потребує `XNamespace + "name"` у запитах; простори імен за замовчуванням не діють на атрибути.
