Not everything a script does is about the current form. `Xrm.Navigation`, `Xrm.Utility` and `Xrm.App` cover dialogs, navigation and app-wide services.

## Dialogs

```javascript
await Xrm.Navigation.openAlertDialog({ title: "Done", text: "The order was submitted." });

const result = await Xrm.Navigation.openConfirmDialog(
  { title: "Close the case?", text: "The customer will receive a survey." },
  { height: 200, width: 450 });
if (result.confirmed) { /* … */ }

Xrm.Navigation.openErrorDialog({ message: "Could not reach the credit service.", details: error.message });
```

These replace the deprecated `Xrm.Utility.alertDialog` and `confirmDialog`, and the browser's `alert` and `confirm`, which do not fit the app's look and block the page.

## Opening records and pages

```javascript
// A record, or a new record with values pre-filled
Xrm.Navigation.openForm({ entityName: "contact", entityId: contactId });
Xrm.Navigation.openForm(
  { entityName: "contact", useQuickCreateForm: true },
  { parentcustomerid: accountId, parentcustomeridname: "Contoso", parentcustomeridtype: "account" });

// Pages: forms, lists, web resources, custom pages; inline or as a dialog
await Xrm.Navigation.navigateTo(
  { pageType: "entityrecord", entityName: "account", entityId: accountId },
  { target: 2, position: 1, width: { value: 60, unit: "%" } });   // target 2 = dialog

Xrm.Navigation.openUrl("https://contoso.com/help");
```

`navigateTo` is the modern Swiss army knife: `pageType` can be `entityrecord`, `entitylist`, `webresource`, `custom` (a custom page) or `dashboard`, and `target: 2` opens it in a modal dialog over the current page, so the user does not lose context. Its promise resolves when the dialog closes.

## Xrm.Utility

```javascript
const ctx = Xrm.Utility.getGlobalContext();
ctx.userSettings.userId;           // "{GUID}"
ctx.userSettings.userName;
ctx.userSettings.languageId;       // 1033, 1058…
ctx.userSettings.roles.get();      // [{ id, name }] of the user's security roles
ctx.getClientUrl();                // https://contoso.crm4.dynamics.com

Xrm.Utility.showProgressIndicator("Checking credit…");
try { /* await something slow */ } finally { Xrm.Utility.closeProgressIndicator(); }

const picked = await Xrm.Utility.lookupObjects({ entityTypes: ["contact"], allowMultiSelect: true, defaultEntityType: "contact" });
const meta = await Xrm.Utility.getEntityMetadata("account", ["industrycode"]);
const text = Xrm.Utility.getResourceString("contoso_/strings/account", "CreditHold");
```

Use **roles** sparingly for UI decisions ("show the Approve button to managers"), and never as a security check: the server must enforce the rule.

## Xrm.App

- `Xrm.App.addGlobalNotification` / `clearGlobalNotification`: messages for the whole app, with an optional action button.
- `Xrm.App.sidePanes.createPane({ title, paneId, canClose })` then `pane.navigate({ pageType: … })`: a side panel next to the main page, good for a related record or a helper page that stays open while users work.

## Xrm.Device and others

On mobile, `Xrm.Device.captureImage`, `getCurrentPosition`, `pickFile` and `getBarcodeValue` reach the device. `Xrm.Encoding.htmlEncode` / `xmlEncode` protect you when building HTML or FetchXML from user input.

## In an interview

- Show an alert, a confirm dialog and opening a record in a modal dialog.
- Explain what `navigateTo` can open and what `target: 2` does.
- Show how to read the current user's id, language and roles.
- Explain why role checks in scripts are not security.
