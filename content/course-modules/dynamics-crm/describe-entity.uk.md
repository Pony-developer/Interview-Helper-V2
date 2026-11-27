Прочитайте стовпці акаунта так, щоб ніколи не падати на відсутньому чи порожньому значенні.

Програма містить невелику модель класів SDK `Entity`, `EntityReference` і `Money`. Вони поводяться як справжні: індексатор `account["x"]` кидає виняток, коли стовпця немає, а `GetAttributeValue<T>("x")` натомість повертає `default(T)`.

Напишіть `Describe.Account(account)`, що повертає один рядок:

```text
<name> | <city> | <employees> employees | credit <credit limit> | contact <primary contact>
```

| Частина | Стовпець | Коли відсутній чи порожній |
| --- | --- | --- |
| name | `name` (`string`) | `(no name)` |
| city | `address1_city` (`string`) | `-` (і для порожнього рядка) |
| employees | `numberofemployees` (`int`) | `?`, але справжній `0` лишається `0` |
| credit limit | `creditlimit` (`Money`) | `0` |
| primary contact | `primarycontactid` (`EntityReference`), його `Name` | `none` |

Виводьте `decimal` кредитного ліміту через `ToString(CultureInfo.InvariantCulture)`, щоб завжди була крапка. Не змінюйте `Main`. Очікуваний результат:

```text
Contoso | Kyiv | 500 employees | credit 250000 | contact Olena Koval
Fabrikam | - | ? employees | credit 1500.50 | contact none
(no name) | - | ? employees | credit 0 | contact none
Litware | - | 0 employees | credit 0 | contact none
```

Перевірте цікаві рядки: кількість працівників Fabrikam є в сутності, але дорівнює `null`, тож виводиться `?`, а Litware справді має `0` працівників. Третій акаунт не має жодного стовпця.

Підказка: використовуйте `GetAttributeValue<int?>` (зі знаком питання), щоб відрізнити порожнє від нуля, і `??` для значень за замовчуванням: `account.GetAttributeValue<string>("name") ?? "(no name)"`.
