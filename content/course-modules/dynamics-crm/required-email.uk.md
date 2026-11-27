Забезпечте на сервері правило, якого сам скрипт форми не гарантує: кожен контакт мусить мати email.

`ContactEmailPlugin` зареєстровано на **Create** і **Update** контакту на стадії **PreValidation (10)**. Напишіть тіло `Execute`:

- **Update без `emailaddress1` у Target**: email не змінюють, тож нічого не робіть і поверніться.
- Якщо email відсутній, `null`, порожній або лише з пробілів, киньте `InvalidPluginExecutionException`:
  - на Create: `Email is required.`
  - на Update: `Email cannot be cleared.`
- Інакше збережіть email **без пробілів по краях і в нижньому регістрі**, поклавши його назад у `Target`.

Не змінюйте `Main` і `Run`. Очікуваний результат:

```text
== Create contact (stage 10)
  saved: emailaddress1=olena@contoso.com, lastname=Koval
== Create contact (stage 10)
  ERROR: Email is required.
== Create contact (stage 10)
  ERROR: Email is required.
== Update contact (stage 10)
  saved: jobtitle=Sales Manager
== Update contact (stage 10)
  ERROR: Email cannot be cleared.
== Update contact (stage 10)
  saved: emailaddress1=taras@contoso.com
```

Перевірте цікаві рядки: email Ірини — три пробіли, що вважається порожнім. Зміна лише посади проходить, бо оновлення не чіпає email. Очищення email (задання `null`) відхиляється.

Підказка: `string.IsNullOrWhiteSpace(email)` покриває `null`, порожній рядок і пробіли однією перевіркою. Спершу перевірте `context.MessageName == "Update" && !target.Contains("emailaddress1")` і поверніться раніше.
