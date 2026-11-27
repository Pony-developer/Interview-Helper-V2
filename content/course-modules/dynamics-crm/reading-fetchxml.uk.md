Уперше FetchXML виглядає страшно, але це просто SQL, записаний як XML. Його використовують кожне подання, діаграма й багато плагінів, тож уміння швидко його читати — справжня щоденна навичка. Ця сторінка перекладає його частина за частиною.

## Найменший запит

```xml
<fetch>
  <entity name="account">
    <attribute name="name" />
    <attribute name="address1_city" />
  </entity>
</fetch>
```

```sql
SELECT name, address1_city
FROM account
```

`<entity>` — це таблиця (`FROM`), кожен `<attribute>` — стовпець (`SELECT`). Імена — **логічні**.

## Фільтри

```xml
<filter type="and">
  <condition attribute="statecode" operator="eq" value="0" />
  <condition attribute="address1_city" operator="eq" value="Kyiv" />
</filter>
```

```sql
WHERE statecode = 0 AND address1_city = 'Kyiv'
```

`<filter>` за замовчуванням має тип `and`; `type="or"` поєднує умови через `OR`. Фільтри можна вкладати, щоб їх змішувати, як дужки в SQL.

| Оператор FetchXML | SQL |
| --- | --- |
| `eq`, `ne` | `=`, `<>` |
| `gt`, `ge`, `lt`, `le` | `>`, `>=`, `<`, `<=` |
| `null`, `not-null` | `IS NULL`, `IS NOT NULL` |
| `like` з `%` у значенні | `LIKE` |
| `begins-with`, `ends-with` | `LIKE 'x%'`, `LIKE '%x'` |
| `in` з дочірніми `<value>` | `IN (…)` |
| `on`, `last-x-days`, `this-month`… | Умови дат, які платформа перетворює на діапазони дат |
| `eq-userid` | `= <id поточного користувача>` |

## Сортування й сторінки

```xml
<order attribute="name" />
<order attribute="createdon" descending="true" />
```

```sql
ORDER BY name, createdon DESC
```

`<fetch top="10">` означає `LIMIT 10`; `<fetch count="50" page="2">` просить другу сторінку по 50.

## З'єднання через link-entity

```xml
<entity name="contact">
  <attribute name="fullname" />
  <link-entity name="account" from="accountid" to="parentcustomerid" alias="a" link-type="inner">
    <attribute name="name" alias="account" />
  </link-entity>
</entity>
```

```sql
SELECT contact.fullname, a.name AS account
FROM contact
JOIN account a ON a.accountid = contact.parentcustomerid
```

Читайте `from` і `to` так: **`from`** — стовпець **приєднаної** таблиці (account), **`to`** — стовпець **зовнішньої** таблиці (contact). `link-type="inner"` — це `INNER JOIN` (рядки без пари зникають); `link-type="outer"` — `LEFT JOIN`.

## Підрахунок і групування

```xml
<fetch aggregate="true">
  <entity name="contact">
    <attribute name="address1_city" alias="city" groupby="true" />
    <attribute name="contactid" alias="contacts" aggregate="count" />
  </entity>
</fetch>
```

```sql
SELECT address1_city AS city, count(*) AS contacts
FROM contact
GROUP BY address1_city
```

З `aggregate="true"` кожен атрибут потребує `alias` і або `groupby="true"`, або агрегата (`count`, `countcolumn`, `sum`, `avg`, `min`, `max`).

## Як отримати FetchXML з подання

Писати FetchXML вручну не обов'язково. У model-driven застосунку відкрийте подання, зберіть запит через **Edit filters** і виберіть **Download Fetch XML** у класичному Advanced Find, або скористайтеся інструментом **FetchXML Builder** у XrmToolBox. Потім вставте його у свій код.

## Практика

Кожна з трьох практик після квізу показує запит FetchXML. Ваше завдання — написати SQL, що повертає ті самі рядки. Починайте з `<entity>`, далі атрибути, фільтр, зв'язки й сортування, саме в такій послідовності.
