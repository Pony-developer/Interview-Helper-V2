Ця практика використовує іншу базу даних: невелику компанію з таблицею `employees`, де `manager_id` вказує на іншого працівника. Перегляньте її в блоці **База даних практики**.

Виведіть кожного працівника з іменем його керівника, упорядкувавши за `id` працівника. Стовпці — `employee` і `manager`. Директорка Оксана не має керівника, але вона все одно має бути у списку.

Очікуваний вивід:

```text
 employee | manager
----------+---------
 Oksana   | NULL
 Bohdan   | Oksana
 Dmytro   | Bohdan
 Kateryna | Bohdan
 Yulia    | Bohdan
 Roman    | Oksana
 Natalia  | Roman
 Petro    | Roman
 Halyna   | Oksana
 Vasyl    | Halyna
 Lesia    | Dmytro
(11 rows)
```

Підказка: з'єднайте `employees` саму із собою під двома псевдонімами. Який вид з'єднання збереже Оксану?
