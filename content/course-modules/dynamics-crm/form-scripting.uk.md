Model-driven форми можуть виконувати JavaScript: показувати й приховувати поля, перевіряти введення, заповнювати значення, викликати Web API. Скрипти живуть у **веб-ресурсах** і працюють із формою через **Client API**.

## Як під'єднати скрипт до форми

1. Напишіть скрипт (на практиці — TypeScript, скомпільований в один JavaScript-файл) і завантажте його як **JavaScript веб-ресурс**, наприклад `contoso_/scripts/account.js`.
2. У дизайнері форми додайте бібліотеку до форми й зареєструйте **обробники подій**: ім'я функції (з простором імен) і подію.
3. Позначте **Pass execution context as first parameter**.

Використовуйте простір імен, щоб ваші функції не конфліктували з іншими бібліотеками на тій самій формі:

```javascript
var Contoso = Contoso || {};
Contoso.Account = {
  onLoad: function (executionContext) {
    const formContext = executionContext.getFormContext();
    formContext.getAttribute("industrycode").addOnChange(Contoso.Account.onIndustryChange);
    Contoso.Account.onIndustryChange(executionContext);
  },

  onIndustryChange: function (executionContext) {
    const formContext = executionContext.getFormContext();
    const industry = formContext.getAttribute("industrycode").getValue();   // значення choice або null
    const isPublic = industry === 7;
    formContext.getControl("contoso_procurementcode").setVisible(isPublic);
    formContext.getAttribute("contoso_procurementcode").setRequiredLevel(isPublic ? "required" : "none");
  },
};
```

## Client API

- **`executionContext`**: що відбувається. `getFormContext()`, `getEventSource()`, `getEventArgs()` (для OnSave та інших подій, які можна скасувати).
- **`formContext.data.entity`**: запис: `getId()`, `getEntityName()`, `save()`, `getIsDirty()`.
- **Атрибути** (`formContext.getAttribute("name")`): дані. `getValue`, `setValue`, `setRequiredLevel`, `setSubmitMode`, `addOnChange`, `fireOnChange`.
- **Контроли** (`formContext.getControl("name")`): елементи інтерфейсу, прив'язані до атрибутів. `setVisible`, `setDisabled`, `setLabel`, `setNotification`, `addPreSearch` для фільтрації lookup-полів.
- **`formContext.ui`**: вкладки, секції, `setFormNotification`, `clearFormNotification`.
- **`Xrm.WebApi`**: `retrieveRecord`, `retrieveMultipleRecords`, `createRecord`, `updateRecord`, `deleteRecord`, `execute` (для Custom API). Вони повертають проміси.
- **`Xrm.Navigation`**: `openForm`, `openAlertDialog`, `openConfirmDialog`, `navigateTo` (сторінки й діалоги).
- **`Xrm.Utility.getGlobalContext()`**: користувач, організація, інформація про клієнт.

`Xrm.Page` **застарів**. У багатьох місцях він ще працює, але новий код має брати контекст форми з контексту виконання; так код працює й у quick view формах, сітках та інших місцях, де `Xrm.Page` указує не на ту форму.

## Події

- **OnLoad** форми; може бути асинхронним (повертати проміс), якщо це дозволяє налаштування застосунку.
- **OnChange** стовпця.
- **OnSave**: перевірити й за потреби скасувати:

```javascript
onSave: function (executionContext) {
  const formContext = executionContext.getFormContext();
  const limit = formContext.getAttribute("creditlimit").getValue();
  if (limit !== null && limit < 0) {
    executionContext.getEventArgs().preventDefault();
    formContext.ui.setFormNotification("The credit limit cannot be negative.", "ERROR", "credit");
  }
}
```

- Події сіток і вкладок, **PreSearch** на lookup-полях, **TabStateChange**, зміни етапів business process flow.

## Правила на клієнті — не безпека

Усе в браузері можна обійти: API, імпорти, flow та інтеграції ніколи не запускають скрипти форм. Використовуйте скрипти для **зручності користувача**. Правила, які мають виконуватися завжди, належать до **бізнес-правила** з областю таблиці або до **плагіна**. Бізнес-правила також кращий перший вибір для простої логіки «показати, приховати, зробити обов'язковим, задати типове значення», бо мейкери можуть їх читати й змінювати.

## Добрі практики

- Пишіть на TypeScript із типами `@types/xrm`, збирайте й мінімізуйте, зберігайте вихідний код у репозиторії.
- Ніколи не чіпайте DOM (`document.getElementById`): Microsoft вільно змінює HTML, і такий код ламається з кожним оновленням.
- Уникайте синхронного `XMLHttpRequest`; використовуйте `Xrm.WebApi` з промісами.
- Одна бібліотека на таблицю, і якомога менше роботи в OnLoad.

## На співбесіді

- Поясніть, як скрипт отримує контекст форми і чому `Xrm.Page` застарів.
- Покажіть на прикладі методи атрибутів і контролів.
- Покажіть, як скасувати збереження з OnSave.
- Поясніть, чому скриптів форм недостатньо, щоб забезпечити бізнес-правила.
