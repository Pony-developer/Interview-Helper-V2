Під кожним FetchXML-запитом лежить SQL. Перекласти його вручну — поширене завдання на співбесіді, яке показує, що ви розумієте, як насправді працюють link-entity та їхні фільтри.

Практична база містить дві таблиці Dataverse з їхніми справжніми логічними іменами, скорочені до кількох стовпців: `account` і `contact`. `statecode` дорівнює `0` для Active і `1` для Inactive; `contact.parentcustomerid` — це lookup на акаунт. Відкрийте **Practice database** над редактором, щоб побачити рядки.

Подання в застосунку використовує такий FetchXML:

```xml
<fetch aggregate="true">
  <entity name="account">
    <attribute name="name" alias="account" groupby="true" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="contact" from="parentcustomerid" to="accountid" link-type="outer" alias="c">
      <attribute name="contactid" alias="contacts" aggregate="countcolumn" />
      <filter>
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>
    </link-entity>
    <order alias="contacts" descending="true" />
    <order alias="account" />
  </entity>
</fetch>
```

Напишіть SQL-запит, що повертає той самий результат: кожен **активний** акаунт із кількістю його **активних** контактів, у стовпцях `account` і `contacts`, упорядковано за `contacts` від найбільшого до найменшого, потім за `account`. Очікуваний результат:

```text
     account     | contacts
-----------------+----------
 Contoso         |        2
 Fabrikam        |        1
 Litware         |        1
 Adventure Works |        0
(4 rows)
```

Зверніть увагу на Adventure Works: контактів у нього немає, але зв'язок **outer**, тож акаунт лишається з кількістю 0. А в Contoso три контакти, але активні лише два.

Підказка: фільтр усередині зовнішнього link-entity належить до умови `ON` у `LEFT JOIN`. Якщо поставити його в `WHERE`, Adventure Works зникне. `count(стовпець)` рахує лише значення, що не є NULL.
