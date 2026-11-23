Кожен запит OData стає SQL на сервері. Перекласти його вручну — означає показати, що ви розумієте, що насправді роблять `$filter`, `ne null` і `$expand`.

Практична база містить скорочені таблиці Dataverse `account` і `contact` з практики про FetchXML (`statecode` 0 = Active). Відкрийте **Practice database**, щоб побачити рядки.

Скрипт форми виконує такий запит Web API:

```text
GET [org]/api/data/v9.2/contacts
    ?$select=fullname,emailaddress1
    &$expand=parentcustomerid_account($select=name)
    &$filter=statecode eq 0 and emailaddress1 ne null
    &$orderby=fullname
```

Напишіть SQL-запит, що повертає ті самі дані: кожен **активний** контакт **з адресою email**, зі стовпцями `fullname`, `emailaddress1` і `account` (назва батьківського акаунта), упорядковано за `fullname`. Очікуваний результат:

```text
     fullname      |    emailaddress1     |  account
-------------------+----------------------+-----------
 Andrii Shevchenko | andrii@northwind.com | Northwind
 Daria Lysenko     | daria@litware.com    | Litware
 Maksym Kravets    | maksym@fabrikam.com  | Fabrikam
 Olena Koval       | olena@contoso.com    | Contoso
 Petro Hnatiuk     | petro@example.com    | NULL
 Taras Melnyk      | taras@contoso.com    | Contoso
(6 rows)
```

Зверніть увагу:

- **Петро** не має батьківського акаунта, але все одно повертається: розгортання однозначної навігаційної властивості — це **LEFT JOIN**, а не внутрішнє з'єднання.
- Акаунт **Андрія**, Northwind, неактивний, але фільтр стосується лише контактів, тож Андрій лишається.
- `ne null` — це OData-запис для `IS NOT NULL`. У SQL `emailaddress1 <> NULL` ніколи не буває істинним.

Підказка: `LEFT JOIN account a ON a.accountid = c.parentcustomerid` і аліас `AS account` для назви.
