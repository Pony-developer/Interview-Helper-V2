Dataverse пропонує кілька способів запитати рядки. Усі вони зрештою стають SQL у базі платформи, до якого додаються фільтри безпеки для користувача, що викликає.

## QueryExpression

Запит, складений з об'єктів. Його зручно будувати в коді:

```csharp
var query = new QueryExpression("contact")
{
    ColumnSet = new ColumnSet("fullname", "emailaddress1"),
    Criteria = new FilterExpression(LogicalOperator.And)
};
query.Criteria.AddCondition("statecode", ConditionOperator.Equal, 0);
query.Criteria.AddCondition("emailaddress1", ConditionOperator.NotNull);

var link = query.AddLink("account", "parentcustomerid", "accountid", JoinOperator.Inner);
link.EntityAlias = "a";
link.Columns = new ColumnSet("name");
link.LinkCriteria.AddCondition("statecode", ConditionOperator.Equal, 0);
query.AddOrder("fullname", OrderType.Ascending);

EntityCollection result = service.RetrieveMultiple(query);
string accountName = (string)result.Entities[0].GetAttributeValue<AliasedValue>("a.name").Value;
```

Стовпці з приєднаної таблиці повертаються як `AliasedValue` під іменем `аліас.стовпець`.

## FetchXML

Той самий запит у вигляді XML. FetchXML зберігають подання, його використовують звіти, і Web API приймає його в `?fetchXml=`. **FetchXML Builder** в XrmToolBox пише його за вас.

```xml
<fetch top="50">
  <entity name="contact">
    <attribute name="fullname" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="account" from="accountid" to="parentcustomerid" link-type="inner" alias="a">
      <attribute name="name" />
    </link-entity>
    <order attribute="fullname" />
  </entity>
</fetch>
```

`link-entity` — це з'єднання: `from` — стовпець приєднаної таблиці, `to` — стовпець батьківської. `link-type="inner"` відкидає батьківські рядки без збігу; `link-type="outer"` залишає їх (LEFT JOIN). `filter` усередині **outer** link-entity обмежує, які пов'язані рядки приєднуються, так само як умова в `ON` для LEFT JOIN, тож батьківські рядки він не прибирає. Новіші типи зв'язку `exists`, `any` і `not any` виражають «має хоча б один / не має жодного» без дублювання батьківських рядків.

## Агрегати

```xml
<fetch aggregate="true">
  <entity name="opportunity">
    <attribute name="estimatedvalue" alias="total" aggregate="sum" />
    <attribute name="ownerid" alias="owner" groupby="true" />
  </entity>
</fetch>
```

`aggregate` може бути `count`, `countcolumn`, `sum`, `avg`, `min`, `max`; кожен неагрегований атрибут потребує `groupby="true"`, а кожен атрибут — аліасу. Агрегатні запити завершуються помилкою, коли охоплюють понад 50 000 рядків; розбивайте їх (наприклад, за діапазонами дат) або використовуйте інструменти звітності для більших наборів.

## Інші варіанти

- **LINQ** через `OrganizationServiceContext` з early-bound класами, що перекладається в QueryExpression. Читабельно, але не все, що можна написати в LINQ, підтримується.
- **Web API** OData: `GET contacts?$select=fullname&$filter=statecode eq 0&$expand=parentcustomerid_account($select=name)`.
- **Dataverse search** для повнотекстового пошуку по таблицях і **TDS (SQL) endpoint** лише для читання — для інструментів звітності.

## Пагінація

`RetrieveMultiple` повертає щонайбільше **5000** рядків за сторінку. Коли `MoreRecords` дорівнює true, запитуйте наступну сторінку:

```csharp
query.PageInfo = new PagingInfo { Count = 5000, PageNumber = 1 };
while (true)
{
    var page = service.RetrieveMultiple(query);
    Process(page.Entities);
    if (!page.MoreRecords) break;
    query.PageInfo.PageNumber++;
    query.PageInfo.PagingCookie = page.PagingCookie;
}
```

**Paging cookie** дає серверу продовжити з останнього рядка, а не рахувати з початку. У FetchXML ті самі значення йдуть в атрибути `page` і `paging-cookie`; у Web API ви переходите за `@odata.nextLink`. Забута пагінація — класична помилка, коли звіт чи міграція мовчки обробляє лише перші 5000 рядків.

## Поради щодо продуктивності

- Вибирайте лише потрібні стовпці; `new ColumnSet(true)` читає все, включно з дорогими обчислюваними стовпцями.
- Фільтруйте за індексованими стовпцями; уникайте шаблонів із підстановкою на початку (`like '%abc'`).
- Агрегатний запит кращий, ніж отримати рядки й порахувати їх у C#.
- Використовуйте типи зв'язку `exists`/`any` замість inner join з `distinct="true"`, коли треба лише знати, що пов'язані рядки існують.

## На співбесіді

- Напишіть QueryExpression та еквівалентний FetchXML зі з'єднанням і фільтром.
- Поясніть inner проти outer link-entity і де застосовується фільтр зовнішнього зв'язку.
- Напишіть цикл пагінації й поясніть paging cookie.
- Поясніть ліміт агрегатів у 50 000 рядків і як його обійти.
