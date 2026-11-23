Більшість скриптів форм читають значення, щось вирішують і змінюють значення чи контрол. Кожен тип стовпця має власну форму значення, і плутанина з ними — найчастіша причина помилок на клієнті.

## Значення за типами стовпців

```javascript
const fc = executionContext.getFormContext();

fc.getAttribute("name").getValue();             // "Contoso" або null
fc.getAttribute("numberofemployees").getValue(); // 250 або null
fc.getAttribute("creditlimit").getValue();      // 50000 (число; валюта окремо)
fc.getAttribute("donotemail").getValue();       // true / false
fc.getAttribute("createdon").getValue();        // об'єкт Date у часовому поясі користувача
fc.getAttribute("industrycode").getValue();     // 7 (значення choice) або null
fc.getAttribute("industrycode").getText();      // "Consulting" (підпис)
fc.getAttribute("contoso_channels").getValue(); // [1, 3] для choice з множинним вибором
fc.getAttribute("primarycontactid").getValue(); // [{ id: "{GUID}", name: "Olena Koval", entityType: "contact" }] або null
```

`getAttributeType()` повертає `string`, `memo`, `integer`, `decimal`, `double`, `money`, `boolean`, `datetime`, `optionset`, `multiselectoptionset` або `lookup`, що зручно в універсальних допоміжних функціях.

**Lookup** — це масиви (одиночний lookup має один елемент), а id приходять у фігурних дужках і верхньому регістрі. Нормалізуйте перед порівнянням: `id.replace(/[{}]/g, "").toLowerCase()`.

## Задавання значень

```javascript
fc.getAttribute("telephone1").setValue("+380 44 000 0000");
fc.getAttribute("industrycode").setValue(7);
fc.getAttribute("primarycontactid").setValue([{ id: contactId, name: "Olena Koval", entityType: "contact" }]);
fc.getAttribute("primarycontactid").setValue(null);   // очистити
```

Програмне задавання значення **не** запускає OnChange. Якщо від нього залежить інша логіка, викличте після цього `fireOnChange()`.

Інші методи атрибута:

- `setRequiredLevel("none" | "recommended" | "required")`;
- `setSubmitMode("always" | "never" | "dirty")`: чи надсилати значення під час збереження. Вимкнене поле, змінене скриптом, надсилається лише якщо воно «брудне» (так типово); використовуйте `"always"`, коли треба бути певним;
- `getIsDirty()`, `getInitialValue()` (для choice і boolean), `addOnChange(handler)` / `removeOnChange(handler)`;
- `controls`: усі контроли, прив'язані до цього атрибута, наприклад те саме поле в заголовку й у тілі.

## Контроли

```javascript
const control = fc.getControl("contoso_procurementcode");
control.setVisible(false);
control.setDisabled(true);
control.setLabel("Procurement code (public sector)");
control.setFocus();
control.setNotification("Use the format PRC-0000", "procurement-format");
control.clearNotification("procurement-format");
```

Контроли choice можуть змінювати свої варіанти лише для цієї форми: `clearOptions()`, `addOption({ value, text })`, `removeOption(value)`, — це корисно, коли допустимі значення залежать від іншого поля.

## Копії в заголовку та business process flow

Той самий стовпець може бути в заголовку (`header_creditlimit`) і в business process flow (`header_process_creditlimit`). Це **окремі контроли** одного атрибута. Щоб приховати чи заблокувати поле всюди, пройдіться циклом: `attribute.controls.forEach(c => c.setDisabled(true))`.

## Обережні скрипти

- `getAttribute` і `getControl` повертають **null**, коли стовпця немає на цій формі. Форми змінюються; перевіряйте перед викликом.
- Значення можуть бути `null`: перевіряйте, перш ніж використовувати `.length`, `[0].id` чи арифметику.
- Використовуйте один скрипт на кількох формах, перевіряючи наявність, а не припускаючи розмітку.

```javascript
const limit = fc.getAttribute("creditlimit");
if (limit && limit.getValue() !== null && limit.getValue() > 100000) { /* … */ }
```

## На співбесіді

- Назвіть форму значення для lookup, choice і дати.
- Покажіть, як задати й очистити lookup.
- Поясніть, чому `setValue` не запускає OnChange і що з цим робити.
- Поясніть `setSubmitMode` і коли зберігається значення вимкненого поля.
