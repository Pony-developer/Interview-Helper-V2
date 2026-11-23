## Наростаючі підсумки

Додайте `ORDER BY` усередину `OVER`, і агрегат стає накопичувальним:

```sql
SELECT store, day, amount,
       sum(amount) OVER (PARTITION BY store ORDER BY day) AS running_total
FROM daily_sales;
```

```text
 store |    day     | amount | running_total
-------+------------+--------+---------------
 Kyiv  | 2024-09-01 | 120.00 |        120.00
 Kyiv  | 2024-09-02 |  80.00 |        200.00
 Kyiv  | 2024-09-03 | 150.00 |        350.00
 …
```

Чому `ORDER BY` змінює зміст? Бо він змінює типову **рамку**.

## Рамки

Рамка — це частина розділу, яку функція бачить для поточного рядка:

```sql
sum(amount) OVER (
    PARTITION BY store
    ORDER BY day
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW     -- рамка
)
```

| Вікно | Типова рамка |
|---|---|
| Без `ORDER BY` | Увесь розділ |
| З `ORDER BY` | `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`: від початку до поточного рядка **і рівних йому** (рядків з тим самим значенням сортування) |

Одиниці рамки:

- `ROWS`: рахує фізичні рядки. `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` — поточний рядок і два перед ним: **ковзне середнє за 3 дні** з `avg`.
- `RANGE`: працює зі значеннями. `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` — «останні 7 календарних днів», що залишається правильним, коли для деяких днів немає рядків.
- `GROUPS`: рахує групи рівних рядків.

Межі: `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`.

Деталь про «рівних» важлива: якщо два рядки мають однаковий `day`, типова рамка `RANGE` включає обидва, тож вони отримують однаковий наростаючий підсумок. Використовуйте `ROWS` (або унікальний ключ сортування), коли потрібен підсумок строго рядок за рядком.

## LAG і LEAD

`lag(x)` повертає `x` з попереднього рядка розділу, `lead(x)` — з наступного:

```sql
SELECT store, day, amount,
       lag(amount)  OVER w AS prev_day,
       amount - lag(amount) OVER w AS change,
       round(100.0 * (amount - lag(amount) OVER w) / lag(amount) OVER w, 1) AS change_pct,
       lead(day)    OVER w AS next_day
FROM daily_sales
WINDOW w AS (PARTITION BY store ORDER BY day);
```

- Для першого рядка попереднього немає, тож `lag` повертає `NULL` (як і все, що з нього обчислено).
- `lag(x, 7)` дивиться на 7 рядків назад (тиждень до тижня), а `lag(x, 1, 0)` використовує `0` замість `NULL`.

Класичні задачі з `lag`/`lead` на співбесідах: приріст день до дня, час між послідовними входами користувача, пошук пропусків у послідовності id, виділення сесій (нова сесія починається, коли проміжок до попередньої події перевищує 30 хвилин).

## first_value, last_value, nth_value

```sql
SELECT name, department, salary,
       first_value(name) OVER (PARTITION BY department ORDER BY salary DESC) AS top_earner
FROM employees;
```

`last_value` має пастку: за типової рамки рамка закінчується на поточному рядку, тож `last_value` повертає значення поточного рядка. Розширте рамку:

```sql
last_value(name) OVER (
    PARTITION BY department ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
)
```

## Про продуктивність

Кожне окреме `OVER (…)` може потребувати власного сортування даних. Де можливо, використовуйте одне іменоване `WINDOW`, а індекс, що відповідає `PARTITION BY … ORDER BY …`, дозволяє PostgreSQL обійтися без сортування.
