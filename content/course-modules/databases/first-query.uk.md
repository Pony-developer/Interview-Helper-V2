Час познайомитися з базою даних магазину. Розгорніть **База даних практики** над редактором і подивіться на таблицю `customers`.

Напишіть запит, що показує `name` і `city` **кожного** клієнта, упорядкувавши за іменем (від A до Z). Очікуваний вивід:

```text
       name        | city
-------------------+-------
 Andrii Shevchenko | Odesa
 Iryna Bondar      | Kyiv
 Maksym Kravets    | Lviv
 Olena Koval       | Kyiv
 Sofia Tkachenko   | NULL
 Taras Melnyk      | Lviv
(6 rows)
```

У Софії немає міста: база зберігає там `NULL`, і редактор друкує його як `NULL`.

Підказка: `SELECT <стовпці> FROM <таблиця> ORDER BY <стовпець>;`
