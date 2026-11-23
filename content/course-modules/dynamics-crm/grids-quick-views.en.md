Forms contain more than fields: subgrids of related records, quick view forms showing the parent's data, and tabs that load on demand. Each has its own API and, importantly, its own loading time.

## Subgrids

A subgrid is a control on the form; its name is the one given in the form designer.

```javascript
const grid = formContext.getControl("Contacts");

grid.addOnLoad(() => {                      // the grid (re)loaded its rows
  const count = grid.getGrid().getTotalRecordCount();
  formContext.getControl("contoso_contactcount")?.setNotification(
    count === 0 ? "Add at least one contact." : null, "contacts");
});

grid.refresh();                             // reload after a script created related records
const rows = grid.getGrid().getRows();      // rows on the current page
rows.forEach(row => {
  const data = row.data.entity;
  console.log(data.getId(), data.getPrimaryAttributeValue());
});
const selected = grid.getGrid().getSelectedRows();
const view = grid.getViewSelector().getCurrentView();   // { entityType, id, name }
```

The subgrid is **not ready** in the form's OnLoad: register `addOnLoad` on the grid control and work there. `getRows()` returns only the current page, not every related record; for totals use `getTotalRecordCount()` or a Web API query.

**Editable grids** add their own events (`OnRowSelect`, `OnChange` of a cell, `OnSave` of a row) with a grid-row context, registered in the editable grid's properties.

## Quick view forms

A quick view shows read-only data of a related record (the parent account's credit limit on a contact form).

```javascript
const qv = formContext.ui.quickForms.get("account_summary");
if (qv && qv.isLoaded()) {
  const limit = qv.getControl("creditlimit").getAttribute().getValue();
}
```

Quick views load asynchronously and reload when their lookup changes. Check `isLoaded()`, and if it is not loaded yet, retry briefly or, better, read the value with the Web API using the lookup's id. Values in a quick view are read-only; to change the account, open its form or use the Web API.

## Tabs that load on demand

Collapsed tabs, and their subgrids, can load only when expanded. Use that:

```javascript
formContext.ui.tabs.get("tab_orders").addTabStateChange(async () => {
  if (formContext.ui.tabs.get("tab_orders").getDisplayState() !== "expanded") return;
  const totals = await Xrm.WebApi.retrieveMultipleRecords("salesorder",
    `?$select=totalamount&$filter=_customerid_value eq ${accountId}`);
  // fill read-only summary fields or a notification
});
```

## Timeline and other controls

The **timeline** (`formContext.getControl("Timeline")`) supports `refresh()`; **web resource** and **iframe** controls support `getContentWindow()` and `setSrc()`, covered in the HTML web resources module; **knowledge base** and **map** controls have their own small APIs.

## In an interview

- Show how to react when a subgrid finishes loading and how to refresh it.
- Explain why `getRows()` is not a count of all related records.
- Read a value from a quick view safely.
- Explain how to defer work until a tab is opened.
