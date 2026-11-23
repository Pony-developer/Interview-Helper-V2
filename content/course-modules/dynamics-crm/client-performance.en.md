Users judge a CRM by how quickly its forms open. Scripts are a common cause of slow forms, and most of the fixes are simple.

## Do less in OnLoad

OnLoad runs on every form open. Every request there delays the moment users can work.

- Only run logic that affects what the user sees **immediately**.
- Move the rest to the moment it is needed: an OnChange, a tab expanding, a command click.
- Check the form type and return early on read-only or bulk-edit forms when the logic does not apply.

## Asynchronous, parallel, selective

```javascript
// Slow: one after another, every column
const account = await Xrm.WebApi.retrieveRecord("account", accountId);
const orders = await Xrm.WebApi.retrieveMultipleRecords("salesorder", `?$filter=_customerid_value eq ${accountId}`);

// Fast: in parallel, only what is needed
const [account2, orders2] = await Promise.all([
  Xrm.WebApi.retrieveRecord("account", accountId, "?$select=creditlimit,creditonhold"),
  Xrm.WebApi.retrieveMultipleRecords("salesorder",
    `?$select=totalamount&$filter=_customerid_value eq ${accountId} and statecode eq 0&$top=50`),
]);
```

- **Never** use synchronous `XMLHttpRequest`: it freezes the browser and is deprecated by browsers.
- Always `$select` columns; `$top` lists; filter on the server, not in JavaScript.
- Prefer one query with `$expand` to many small ones.

## Don't fetch what the form already has

Values on the form (including quick views and lookups' names) need no request. Data of the parent account? Consider a quick view or a lookup's `$expand`, rather than a Retrieve in OnLoad.

## Cache stable data

Configuration values, metadata (`Xrm.Utility.getEntityMetadata`), the user's roles and team memberships change rarely. Load them once and cache them in a module-level variable or `sessionStorage` for the session, keyed by the environment URL and user.

## Keep libraries small

- One bundle per table; shared code in a separate, cached library.
- No big frameworks (jQuery, Lodash, moment) on forms unless they earn their weight; modern JavaScript covers most needs.
- Minify. Web resources are cached by the browser and versioned on publish, so a small file costs little after the first load.

## Forms themselves

Many slow forms are slow because of their **design**, not their scripts: dozens of subgrids, many quick views, huge tabs. Put rarely used subgrids in collapsed tabs, limit the number of controls, and use the **form checker** in Monitor (below) to see what costs time.

## Measure

- **Power Apps Monitor** (*Monitor* from the app or `make.powerapps.com`) records form load phases, script handler durations and network requests for model-driven apps.
- The browser's **Network** and **Performance** tabs show slow requests and long-running script.
- Measure before and after a change; optimise what is measured, not what is guessed.

## In an interview

- Give five ways to make a form with scripts load faster.
- Explain why parallel requests with `Promise.all` help and when they don't.
- Explain what to cache on the client and what not.
- Name the tools you use to measure form performance.
