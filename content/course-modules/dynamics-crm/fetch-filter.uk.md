Подання *Sales people with email* використовує такий FetchXML:

```xml
<fetch>
  <entity name="contact">
    <attribute name="fullname" />
    <attribute name="jobtitle" />
    <attribute name="emailaddress1" />
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0" />
      <condition attribute="jobtitle" operator="begins-with" value="Sales" />
      <condition attribute="emailaddress1" operator="not-null" />
    </filter>
    <order attribute="fullname" />
  </entity>
</fetch>
```

Практична база має таблиці `account` і `contact` з їхніми справжніми логічними іменами. Відкрийте **Практичну базу даних** над редактором, щоб побачити рядки.

Напишіть SQL-запит, що повертає ті самі рядки й стовпці. Очікуваний результат:

```text
     fullname      |       jobtitle       |    emailaddress1
-------------------+----------------------+----------------------
 Andrii Shevchenko | Sales Representative | andrii@northwind.com
 Maksym Kravets    | Sales Director       | maksym@fabrikam.com
 Olena Koval       | Sales Manager        | olena@contoso.com
(3 rows)
```

Підказка: перекладайте рядок за рядком. Три умови у фільтрі `and` стають трьома умовами через `AND`; `begins-with` стає `LIKE 'Sales%'`, а `not-null` — `IS NOT NULL`.
