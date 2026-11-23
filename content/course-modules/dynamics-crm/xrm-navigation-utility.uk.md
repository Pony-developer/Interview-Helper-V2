Не все, що робить скрипт, стосується поточної форми. `Xrm.Navigation`, `Xrm.Utility` та `Xrm.App` охоплюють діалоги, навігацію й сервіси рівня застосунку.

## Діалоги

```javascript
await Xrm.Navigation.openAlertDialog({ title: "Done", text: "The order was submitted." });

const result = await Xrm.Navigation.openConfirmDialog(
  { title: "Close the case?", text: "The customer will receive a survey." },
  { height: 200, width: 450 });
if (result.confirmed) { /* … */ }

Xrm.Navigation.openErrorDialog({ message: "Could not reach the credit service.", details: error.message });
```

Вони замінюють застарілі `Xrm.Utility.alertDialog` і `confirmDialog`, а також браузерні `alert` і `confirm`, які не пасують до вигляду застосунку й блокують сторінку.

## Відкриття записів і сторінок

```javascript
// Запис або новий запис із заповненими значеннями
Xrm.Navigation.openForm({ entityName: "contact", entityId: contactId });
Xrm.Navigation.openForm(
  { entityName: "contact", useQuickCreateForm: true },
  { parentcustomerid: accountId, parentcustomeridname: "Contoso", parentcustomeridtype: "account" });

// Сторінки: форми, списки, веб-ресурси, custom pages; вбудовано чи як діалог
await Xrm.Navigation.navigateTo(
  { pageType: "entityrecord", entityName: "account", entityId: accountId },
  { target: 2, position: 1, width: { value: 60, unit: "%" } });   // target 2 = діалог

Xrm.Navigation.openUrl("https://contoso.com/help");
```

`navigateTo` — сучасний універсальний інструмент: `pageType` може бути `entityrecord`, `entitylist`, `webresource`, `custom` (custom page) чи `dashboard`, а `target: 2` відкриває сторінку в модальному діалозі поверх поточної, тож користувач не втрачає контекст. Його проміс завершується, коли діалог закрито.

## Xrm.Utility

```javascript
const ctx = Xrm.Utility.getGlobalContext();
ctx.userSettings.userId;           // "{GUID}"
ctx.userSettings.userName;
ctx.userSettings.languageId;       // 1033, 1058…
ctx.userSettings.roles.get();      // [{ id, name }] ролей безпеки користувача
ctx.getClientUrl();                // https://contoso.crm4.dynamics.com

Xrm.Utility.showProgressIndicator("Checking credit…");
try { /* await щось повільне */ } finally { Xrm.Utility.closeProgressIndicator(); }

const picked = await Xrm.Utility.lookupObjects({ entityTypes: ["contact"], allowMultiSelect: true, defaultEntityType: "contact" });
const meta = await Xrm.Utility.getEntityMetadata("account", ["industrycode"]);
const text = Xrm.Utility.getResourceString("contoso_/strings/account", "CreditHold");
```

Використовуйте **ролі** обережно для рішень інтерфейсу («показати кнопку Approve менеджерам») і ніколи як перевірку безпеки: правило має забезпечувати сервер.

## Xrm.App

- `Xrm.App.addGlobalNotification` / `clearGlobalNotification`: повідомлення для всього застосунку з необов'язковою кнопкою дії.
- `Xrm.App.sidePanes.createPane({ title, paneId, canClose })`, потім `pane.navigate({ pageType: … })`: бічна панель поруч з основною сторінкою, добра для пов'язаного запису чи допоміжної сторінки, що лишається відкритою, поки користувачі працюють.

## Xrm.Device та інші

На мобільних `Xrm.Device.captureImage`, `getCurrentPosition`, `pickFile` і `getBarcodeValue` працюють із пристроєм. `Xrm.Encoding.htmlEncode` / `xmlEncode` захищають вас, коли ви будуєте HTML чи FetchXML із введення користувача.

## На співбесіді

- Покажіть alert, діалог підтвердження й відкриття запису в модальному діалозі.
- Поясніть, що може відкрити `navigateTo` і що робить `target: 2`.
- Покажіть, як прочитати id, мову й ролі поточного користувача.
- Поясніть, чому перевірки ролей у скриптах — не безпека.
