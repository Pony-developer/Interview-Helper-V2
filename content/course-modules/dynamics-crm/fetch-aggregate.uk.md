Діаграма на дашборді контактів показує *Активні контакти за містами*. Її FetchXML:

```xml
<fetch aggregate="true">
  <entity name="contact">
    <attribute name="address1_city" alias="city" groupby="true" />
    <attribute name="contactid" alias="contacts" aggregate="count" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <order alias="contacts" descending="true" />
    <order alias="city" />
  </entity>
</fetch>
```

Напишіть SQL-запит, що повертає той самий результат зі стовпцями `city` і `contacts`, відсортований за кількістю контактів від більшої до меншої, потім за містом. Очікуваний результат:

```text
 city  | contacts
-------+----------
 Kyiv  |        4
 Lviv  |        2
 Odesa |        1
(3 rows)
```

У Києві п'ять контактів, але Iryna Bondar неактивна, тож діаграма рахує чотири.

Підказка: `groupby="true"` стає `GROUP BY`, `aggregate="count"` — `count(*)`, а кожен `alias` — `AS`. В `ORDER BY` можна використовувати псевдоніми.
