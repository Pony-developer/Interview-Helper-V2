Most form scripts read a value, decide something, and change a value or a control. Each column type has its own value shape, and mixing them up is the most common source of client-side bugs.

## Values by column type

```javascript
const fc = executionContext.getFormContext();

fc.getAttribute("name").getValue();             // "Contoso" or null
fc.getAttribute("numberofemployees").getValue(); // 250 or null
fc.getAttribute("creditlimit").getValue();      // 50000 (a number; currency is separate)
fc.getAttribute("donotemail").getValue();       // true / false
fc.getAttribute("createdon").getValue();        // a Date object, in the user's time zone
fc.getAttribute("industrycode").getValue();     // 7 (the choice value) or null
fc.getAttribute("industrycode").getText();      // "Consulting" (the label)
fc.getAttribute("contoso_channels").getValue(); // [1, 3] for a multi-select choice
fc.getAttribute("primarycontactid").getValue(); // [{ id: "{GUID}", name: "Olena Koval", entityType: "contact" }] or null
```

`getAttributeType()` returns `string`, `memo`, `integer`, `decimal`, `double`, `money`, `boolean`, `datetime`, `optionset`, `multiselectoptionset` or `lookup`, which is handy in generic helpers.

**Lookups** are arrays (a single lookup has one element) and ids come in braces and upper case. Normalise before comparing: `id.replace(/[{}]/g, "").toLowerCase()`.

## Setting values

```javascript
fc.getAttribute("telephone1").setValue("+380 44 000 0000");
fc.getAttribute("industrycode").setValue(7);
fc.getAttribute("primarycontactid").setValue([{ id: contactId, name: "Olena Koval", entityType: "contact" }]);
fc.getAttribute("primarycontactid").setValue(null);   // clear
```

Setting a value programmatically does **not** fire OnChange. If other logic depends on it, call `fireOnChange()` afterwards.

Other attribute methods:

- `setRequiredLevel("none" | "recommended" | "required")`;
- `setSubmitMode("always" | "never" | "dirty")`: whether the value is sent on save. A disabled field changed by script is sent only if dirty, which is the default; use `"always"` when you must be sure;
- `getIsDirty()`, `getInitialValue()` (for choice and boolean), `addOnChange(handler)` / `removeOnChange(handler)`;
- `controls`: every control bound to this attribute, for example the same field in the header and the body.

## Controls

```javascript
const control = fc.getControl("contoso_procurementcode");
control.setVisible(false);
control.setDisabled(true);
control.setLabel("Procurement code (public sector)");
control.setFocus();
control.setNotification("Use the format PRC-0000", "procurement-format");
control.clearNotification("procurement-format");
```

Choice controls can change their options for this form only: `clearOptions()`, `addOption({ value, text })`, `removeOption(value)`, which is useful when the allowed values depend on another field.

## Header and business process flow copies

The same column can appear in the header (`header_creditlimit`) and in a business process flow (`header_process_creditlimit`). These are **separate controls** of one attribute. To hide or lock a field everywhere, loop over `attribute.controls.forEach(c => c.setDisabled(true))`.

## Defensive scripts

- `getAttribute` and `getControl` return **null** when the column is not on this form. Forms change; check before calling.
- Values can be `null`: check before using `.length`, `[0].id` or arithmetic.
- Reuse one script on several forms by checking existence, not by assuming the layout.

```javascript
const limit = fc.getAttribute("creditlimit");
if (limit && limit.getValue() !== null && limit.getValue() > 100000) { /* … */ }
```

## In an interview

- Give the value shape of a lookup, a choice and a date.
- Show how to set and clear a lookup.
- Explain why `setValue` does not fire OnChange and what to do about it.
- Explain `setSubmitMode` and when a disabled field's value is saved.
