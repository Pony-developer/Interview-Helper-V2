Model-driven forms can run JavaScript: show and hide fields, validate input, fill values, call the Web API. The scripts live in **web resources** and talk to the form through the **Client API**.

## Wiring a script to a form

1. Write the script (in practice TypeScript, compiled to one JavaScript file) and upload it as a **JavaScript web resource**, for example `contoso_/scripts/account.js`.
2. In the form designer, add the library to the form and register **event handlers**: the function name (with its namespace) and the event.
3. Tick **Pass execution context as first parameter**.

Use a namespace so your functions do not collide with other libraries on the same form:

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
    const industry = formContext.getAttribute("industrycode").getValue();   // choice value or null
    const isPublic = industry === 7;
    formContext.getControl("contoso_procurementcode").setVisible(isPublic);
    formContext.getAttribute("contoso_procurementcode").setRequiredLevel(isPublic ? "required" : "none");
  },
};
```

## The Client API

- **`executionContext`**: what is happening. `getFormContext()`, `getEventSource()`, `getEventArgs()` (for OnSave and other cancellable events).
- **`formContext.data.entity`**: the record: `getId()`, `getEntityName()`, `save()`, `getIsDirty()`.
- **Attributes** (`formContext.getAttribute("name")`): the data. `getValue`, `setValue`, `setRequiredLevel`, `setSubmitMode`, `addOnChange`, `fireOnChange`.
- **Controls** (`formContext.getControl("name")`): the UI elements bound to attributes. `setVisible`, `setDisabled`, `setLabel`, `setNotification`, `addPreSearch` to filter lookups.
- **`formContext.ui`**: tabs, sections, `setFormNotification`, `clearFormNotification`.
- **`Xrm.WebApi`**: `retrieveRecord`, `retrieveMultipleRecords`, `createRecord`, `updateRecord`, `deleteRecord`, `execute` (for Custom APIs). They return promises.
- **`Xrm.Navigation`**: `openForm`, `openAlertDialog`, `openConfirmDialog`, `navigateTo` (pages and dialogs).
- **`Xrm.Utility.getGlobalContext()`**: the user, the organization, client information.

`Xrm.Page` is **deprecated**. It still works in many places, but new code must use the form context from the execution context; it also works inside quick view forms, grids and other places where `Xrm.Page` points at the wrong form.

## Events

- **OnLoad** of the form; can be asynchronous (return a promise) when the app setting allows it.
- **OnChange** of a column.
- **OnSave**: validate and, if needed, cancel:

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

- Grid and tab events, **PreSearch** on lookups, **TabStateChange**, business process flow stage changes.

## Client rules are not security

Everything in the browser can be bypassed: the API, imports, flows and integrations never run form scripts. Use scripts for **user experience**. Rules that must always hold belong in a **business rule** with table scope or in a **plug-in**. Business rules are also the better first choice for simple show, hide, require and default logic, because makers can read and change them.

## Good practice

- Write TypeScript with the `@types/xrm` typings, bundle and minify, keep the source in the repository.
- Never touch the DOM (`document.getElementById`): Microsoft changes the HTML freely, and such code breaks with every update.
- Avoid synchronous `XMLHttpRequest`; use `Xrm.WebApi` with promises.
- Keep one library per table, and do as little as possible in OnLoad.

## In an interview

- Explain how a script gets the form context and why `Xrm.Page` is deprecated.
- Show attribute vs control methods with an example.
- Show how to cancel a save from OnSave.
- Explain why form scripts are not enough to enforce business rules.
