Форми містять не лише поля: підсітки пов'язаних записів, quick view форми з даними батьківського запису й вкладки, що завантажуються на вимогу. Кожна з цих частин має власний API і, що важливо, власний час завантаження.

## Підсітки

Підсітка — це контрол на формі; її ім'я задається в дизайнері форм.

```javascript
const grid = formContext.getControl("Contacts");

grid.addOnLoad(() => {                      // сітка (пере)завантажила рядки
  const count = grid.getGrid().getTotalRecordCount();
  formContext.getControl("contoso_contactcount")?.setNotification(
    count === 0 ? "Add at least one contact." : null, "contacts");
});

grid.refresh();                             // перезавантажити після того, як скрипт створив пов'язані записи
const rows = grid.getGrid().getRows();      // рядки на поточній сторінці
rows.forEach(row => {
  const data = row.data.entity;
  console.log(data.getId(), data.getPrimaryAttributeValue());
});
const selected = grid.getGrid().getSelectedRows();
const view = grid.getViewSelector().getCurrentView();   // { entityType, id, name }
```

Підсітка **не готова** в OnLoad форми: зареєструйте `addOnLoad` на контролі сітки й працюйте там. `getRows()` повертає лише поточну сторінку, а не всі пов'язані записи; для підсумків використовуйте `getTotalRecordCount()` або запит до Web API.

**Редаговані сітки** (editable grids) додають власні події (`OnRowSelect`, `OnChange` клітинки, `OnSave` рядка) з контекстом рядка сітки, які реєструються у властивостях редагованої сітки.

## Quick view форми

Quick view показує дані пов'язаного запису лише для читання (кредитний ліміт батьківського акаунта на формі контакту).

```javascript
const qv = formContext.ui.quickForms.get("account_summary");
if (qv && qv.isLoaded()) {
  const limit = qv.getControl("creditlimit").getAttribute().getValue();
}
```

Quick view завантажуються асинхронно й перезавантажуються, коли змінюється їхній lookup. Перевіряйте `isLoaded()`, а якщо ще не завантажено, коротко повторіть спробу або, краще, прочитайте значення через Web API за id з lookup. Значення в quick view лише для читання; щоб змінити акаунт, відкрийте його форму чи використайте Web API.

## Вкладки, що завантажуються на вимогу

Згорнуті вкладки та їхні підсітки можуть завантажуватися лише після розгортання. Користуйтеся цим:

```javascript
formContext.ui.tabs.get("tab_orders").addTabStateChange(async () => {
  if (formContext.ui.tabs.get("tab_orders").getDisplayState() !== "expanded") return;
  const totals = await Xrm.WebApi.retrieveMultipleRecords("salesorder",
    `?$select=totalamount&$filter=_customerid_value eq ${accountId}`);
  // заповнити поля зведення лише для читання чи сповіщення
});
```

## Стрічка подій та інші контроли

**Стрічка подій** (`formContext.getControl("Timeline")`) підтримує `refresh()`; контроли **веб-ресурсу** та **iframe** підтримують `getContentWindow()` і `setSrc()`, про що йдеться в модулі про HTML веб-ресурси; контроли **бази знань** і **карти** мають власні невеликі API.

## На співбесіді

- Покажіть, як реагувати на завершення завантаження підсітки й як її оновити.
- Поясніть, чому `getRows()` — не кількість усіх пов'язаних записів.
- Безпечно прочитайте значення з quick view.
- Поясніть, як відкласти роботу до відкриття вкладки.
