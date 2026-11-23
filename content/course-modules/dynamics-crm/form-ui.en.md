Beyond single fields, scripts shape the form: which tabs and sections are visible, which messages users see, and how the form behaves for new and existing records.

## Form type

```javascript
const formType = formContext.ui.getFormType();
// 0 Undefined, 1 Create, 2 Update, 3 Read Only, 4 Disabled, 6 Bulk Edit
if (formType === 1) {
  formContext.getAttribute("contoso_source").setValue(3);   // defaults for new records only
}
```

Use it to apply defaults only on create, to skip logic on read-only forms, and to avoid breaking **bulk edit**, where many records are edited at once and most of the form API is limited.

## Tabs and sections

```javascript
const tab = formContext.ui.tabs.get("tab_compliance");
tab.setVisible(isPublicSector);
tab.setDisplayState("expanded");                // or "collapsed"
tab.setFocus();

const section = tab.sections.get("section_tenders");
section.setVisible(isPublicSector);
```

Hiding a section hides its fields, but they stay on the form: required fields in hidden sections still block saving. Change the required level when you hide them.

`tab.addTabStateChange(handler)` runs when a tab is expanded or collapsed, which allows lazy loading: fetch a tab's data only when the user opens it.

## Notifications

Three levels, from the widest to the narrowest:

```javascript
// The whole app (banner at the top), stays across forms
// type 2 = message bar; level 1 Success, 2 Error, 3 Warning, 4 Information
const id = await Xrm.App.addGlobalNotification({ type: 2, level: 4, message: "Maintenance tonight at 22:00", showCloseButton: true });
Xrm.App.clearGlobalNotification(id);

// The form (bar under the header)
formContext.ui.setFormNotification("This account is on credit hold.", "WARNING", "credit-hold");
formContext.ui.clearFormNotification("credit-hold");

// One field (red message under the control)
formContext.getControl("emailaddress1").setNotification("Use a company address.", "email-domain");
formContext.getControl("emailaddress1").clearNotification("email-domain");
```

Form notification levels are `"ERROR"`, `"WARNING"` and `"INFO"`. A field with a notification **blocks the save** until it is cleared, which makes field notifications a lightweight validation tool. `addNotification` on a control can also offer **recommendations** with an action button ("Set the country from the city?").

Always use a **unique id** and clear the notification when the condition is gone, or messages pile up.

## Other UI operations

- `formContext.ui.refreshRibbon()` re-evaluates command visibility after a value changes.
- `formContext.ui.close()` closes the form.
- `formContext.ui.formSelector.items.get(id).navigate()` switches to another form.
- `formContext.ui.headerSection.setBodyVisible(false)` and friends control the header.
- `formContext.ui.setFormEntityName("Customer")` changes the title shown for the table on this form.

## Read-only forms and security

Disabling fields with script is a **user-experience** tool, not security. A user with Write privilege can change the column through another form, a grid, Excel or the API. Use **field security**, business rules with entity scope or plug-ins for rules that must hold.

## In an interview

- List the main form types and what you would do differently on each.
- Explain why a hidden required field still blocks the save.
- Compare app, form and field notifications.
- Explain why disabling fields in script is not security.
