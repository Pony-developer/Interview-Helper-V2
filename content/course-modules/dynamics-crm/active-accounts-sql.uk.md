Кожне подання в model-driven застосунку — це запит під капотом. Почнімо з найпростішого: подання *Active Accounts*.

Практична база має дві таблиці Dataverse з їхніми справжніми логічними іменами, скорочені до кількох стовпців: `account` і `contact`. `statecode` дорівнює `0` для Active і `1` для Inactive. Відкрийте **Практичну базу даних** над редактором, щоб побачити рядки.

Напишіть SQL-запит, що повертає **назву** та **місто** (`address1_city`) кожного **активного** акаунта, відсортовані за назвою від A до Z. Очікуваний результат:

```text
       name       | address1_city
------------------+---------------
 Adventure Works  | Odesa
 Alpine Ski House | Lviv
 Contoso          | Kyiv
 Fabrikam         | Lviv
 Litware          | Kyiv
(5 rows)
```

Northwind відсутній навмисно: він неактивний.

Підказка: потрібні три частини: `SELECT` двох стовпців `FROM account`, лише рядки `WHERE statecode = 0` і `ORDER BY name`.
