Список на дашборді показує активні контакти активних акаунтів у Києві. Його FetchXML:

```xml
<fetch>
  <entity name="contact">
    <attribute name="fullname" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
    <link-entity name="account" from="accountid" to="parentcustomerid" alias="a" link-type="inner">
      <attribute name="name" alias="account" />
      <filter>
        <condition attribute="statecode" operator="eq" value="0" />
        <condition attribute="address1_city" operator="eq" value="Kyiv" />
      </filter>
      <order attribute="name" />
    </link-entity>
    <order attribute="fullname" />
  </entity>
</fetch>
```

Напишіть SQL-запит, що повертає ті самі дані: спершу стовпець `account` (назва акаунта), потім `fullname`, з сортуванням за акаунтом, а потім за повним ім'ям. Очікуваний результат:

```text
 account |   fullname
---------+---------------
 Contoso | Olena Koval
 Contoso | Taras Melnyk
 Litware | Daria Lysenko
(3 rows)
```

Перевірте рядки, яких немає: Iryna Bondar працює в Contoso, але неактивна. Andrii Shevchenko живе в Києві, але його акаунт, Northwind, неактивний. Petro Hnatiuk взагалі не має акаунта, а зв'язок — **inner**.

Підказка: `link-entity` з `link-type="inner"` — це `JOIN account a ON a.accountid = c.parentcustomerid`. Фільтр усередині link-entity стосується стовпців акаунта.
