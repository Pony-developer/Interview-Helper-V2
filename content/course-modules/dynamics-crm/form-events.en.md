Scripts run because something happened. Picking the right event, and knowing its order and its limits, decides whether a script feels instant or gets in the way.

## The main events

| Event | Registered on | When |
| --- | --- | --- |
| **OnLoad** | Form | The form opens, and again after a save that reloads data |
| **OnChange** | Column | The user changes the value and leaves the field (or script calls `fireOnChange`) |
| **OnSave** | Form | Before the record is saved (user, auto-save or script) |
| **OnPostSave** | Form (`formContext.data.entity.addOnPostSave`) | After the save completed, successfully or not |
| **TabStateChange** | Tab | A tab is expanded or collapsed |
| **PreSearch** | Lookup control | Just before the lookup searches |
| **OnLoad** | Subgrid | The subgrid finished loading |
| **OnDataLoad** | Form (`formContext.data.addOnLoad`) | Data was (re)loaded, also after `data.refresh()` |

Register handlers in the form designer, or in code from OnLoad with `addOnChange`, `addOnSave`, `addOnPostSave`, `addPreSearch`; code registration keeps the wiring in source control.

## OnSave

```javascript
function onSave(executionContext) {
  const args = executionContext.getEventArgs();
  const fc = executionContext.getFormContext();
  const mode = args.getSaveMode();   // 1 Save, 2 Save and Close, 59 Save and New, 70 AutoSave

  if (mode === 70) return;           // don't nag on auto-save
  const email = fc.getAttribute("emailaddress1").getValue();
  if (email && !email.endsWith("@contoso.com")) {
    args.preventDefault();
    fc.ui.setFormNotification("Use a company email address.", "ERROR", "email");
  }
}
```

`preventDefault()` cancels the save; `isDefaultPrevented()` tells later handlers it was cancelled. Auto-save runs every 30 seconds by default when the record is dirty: a handler that shows dialogs on every save makes the form unusable.

## Asynchronous OnLoad and OnSave

Handlers can return a **promise**, and the platform waits for it (up to about 10 seconds) when the app's *async onload/onsave handler* settings are on:

```javascript
async function onSave(executionContext) {
  const fc = executionContext.getFormContext();
  const accountId = fc.getAttribute("parentcustomerid").getValue()?.[0]?.id;
  if (!accountId) return;
  const account = await Xrm.WebApi.retrieveRecord("account", accountId, "?$select=creditonhold");
  if (account.creditonhold) {
    executionContext.getEventArgs().preventDefault();
    fc.ui.setFormNotification("The account is on credit hold.", "ERROR", "hold");
  }
}
```

Without async support, a promise is ignored and the save goes ahead before your check finishes; that is the classic "validation sometimes doesn't work" bug.

## Order and timing

- OnLoad handlers run in the order they are listed on the form; libraries load first in their listed order.
- Do not assume subgrids, quick views or web resources are ready in OnLoad: use their own load events, or `isLoaded()` checks.
- After a save, OnLoad does not always run again; `addOnPostSave` and `data.addOnLoad` are the reliable hooks.
- OnChange does not fire for values set by script unless you call `fireOnChange()`.

## Keep handlers small

One function per event, which calls named helpers. Return early when the form type, the user's role or the data says the logic does not apply. Avoid work in OnLoad that is only needed later; load data when a tab opens or a field changes.

## In an interview

- List the form events and when each fires.
- Show how to cancel a save and how to detect auto-save.
- Explain asynchronous OnSave handlers and the bug they fix.
- Explain why a subgrid may not be ready in the form's OnLoad.
