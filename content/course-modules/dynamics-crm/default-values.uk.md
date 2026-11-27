Напишіть плагін PreOperation, що прибирає й доповнює нові акаунти до збереження.

`AccountDefaultsPlugin` зареєстровано на **Create** і **Update** акаунта на стадії **PreOperation (20)**. На цій стадії все, що ви покладете в `Target`, зберігається, тож `service.Update` ніколи не викликають. Напишіть тіло `Execute`:

1. Отримайте контекст і сутність `Target`.
2. Якщо `Target` має `name`, збережіть його без пробілів по краях.
3. Якщо `Target` має `creditlimit` (`Money`) менший за 0, киньте `InvalidPluginExecutionException` з повідомленням `Credit limit cannot be negative.`
4. **Лише на Create**:
   - немає `creditlimit` → задайте `new Money(1000m)`;
   - немає `address1_country` → задайте `"Ukraine"`.

Не змінюйте `Main` і `Run`. Очікуваний результат:

```text
== Create account (stage 20)
  saved: address1_country=Ukraine, creditlimit=1000, name=Contoso
== Create account (stage 20)
  saved: address1_country=Poland, creditlimit=50000, name=Fabrikam
== Create account (stage 20)
  ERROR: Credit limit cannot be negative.
== Update account (stage 20)
  saved: telephone1=+380 44 123 4567
== Update account (stage 20)
  saved: name=Litware
```

Перевірте цікаві рядки: Fabrikam уже має кредитний ліміт і країну, тож вони лишаються. Оновлення телефону **не** отримує типових значень: на Update відсутній у Target стовпець означає «не змінено», і типове значення перезаписало б справжній кредитний ліміт акаунта.

Підказка: `target.GetAttributeValue<string>("name")` повертає `null`, коли назви немає, а `target.Contains("creditlimit")` каже, чи стовпець надіслали.
