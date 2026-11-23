Ця практика поєднує чотири ідеї з останніх лекцій: **конфігурацію**, **shared variables**, **глибину** та **роботу від SYSTEM**.

На **Update** для **account** зареєстровано два кроки:

- `CaptureOldLimitPlugin` (готовий) виконується на **PreOperation** і кладе старий кредитний ліміт із pre-image у `context.SharedVariables["oldCreditLimit"]` як `decimal` (0, якщо ліміту не було).
- `CreditLimitAuditPlugin` (ваш) виконується на **PostOperation** синхронно, з порогом в **unsecure configuration**.

Напишіть обидві частини `CreditLimitAuditPlugin`:

**Конструктор**: збережіть поріг у полі `threshold`. Розберіть `unsecureConfig` через `decimal.Parse(…, CultureInfo.InvariantCulture)`; якщо рядок порожній чи складається з пробілів, використайте `100000`.

**`Execute`**:

1. Отримайте контекст, сервіс трасування та фабрику сервісів із service provider.
2. Якщо `context.Depth > 1`, трасуйте `Skipped at depth <глибина>` і поверніться: аудит лише для змін, зроблених людьми напряму.
3. Якщо Target не містить `creditlimit`, трасуйте `Credit limit not changed` і поверніться.
4. Прочитайте старий ліміт зі shared variable, а новий — із Target (`Money`, `null` означає 0). Якщо зростання (новий − старий) менше за поріг, трасуйте `Change of <зростання> is below <поріг>` і поверніться.
5. Інакше створіть `annotation` (нотатку) **від SYSTEM** (`CreateOrganizationService(null)`), щоб користувачі не могли редагувати чи видаляти слід аудиту:
   - `subject`: `Credit limit raised`;
   - `notetext`: `<старий> -> <новий> by <повне ім'я>`, де повне ім'я — це `fullname` **ініціатора** (`context.InitiatingUserId`), отримане з `systemuser`;
   - `objectid`: `EntityReference` на акаунт.
6. Трасуйте `Audit note created`.

Для трасувань зі значеннями використовуйте `tracing.Trace("…{0}…", value)` із заповнювачами. Не змінюйте `Main` та інший плагін. Очікуваний результат:

```text
== Anna raises Contoso to 100000
  trace: Audit note created
== Anna raises Contoso to 120000
  trace: Change of 20000 is below 50000
== Anna changes Contoso's phone
  trace: Credit limit not changed
== A plug-in raises Contoso to 500000
  trace: Skipped at depth 2
== Ivan sets Fabrikam to 60000
  trace: Audit note created
Notes:
  Credit limit raised | Contoso | owner SYSTEM | 20000 -> 100000 by Anna Shevchenko
  Credit limit raised | Fabrikam | owner SYSTEM | 0 -> 60000 by Ivan Petrenko
```

Нотатки належать SYSTEM, бо їх створив сервіс SYSTEM, але все одно називають справжню людину, прочитану з `InitiatingUserId`. У Fabrikam ліміту не було, тож PreOperation-крок передав 0.

Підказка: `(decimal)context.SharedVariables["oldCreditLimit"]` читає спільне значення. `target.GetAttributeValue<Money>("creditlimit")` повертає `null` для очищеного ліміту, тож перевірте це, перш ніж читати `.Value`.
