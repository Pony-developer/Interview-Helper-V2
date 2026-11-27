Almost everything a Dynamics developer builds hooks into one moment: a row being saved. If you can picture what happens between the click and the database, you know where each kind of logic belongs.

## The journey of one save

A user changes the phone number of an account and clicks **Save**:

```text
Browser (the form)
  1. OnChange scripts ran while the user typed
  2. Business rules (form scope) checked required fields
  3. OnSave scripts run; one of them may cancel the save
        │  HTTP request: Update account
        ▼
Dataverse (the server)
  4. PreValidation plug-ins         ┐
  5. Security check: may this user update this account?
  6. ── the database transaction starts ──
  7. PreOperation plug-ins          │ synchronous: the user waits
  8. The row is written to SQL      │
  9. PostOperation plug-ins         ┘
 10. ── the transaction commits ──
        │  response to the browser, the form shows the saved values
        ▼
After the save
 11. Asynchronous plug-ins and classic workflows (system jobs)
 12. Cloud flows triggered by the change
 13. Rollup columns, search index, audit history
```

## Synchronous and asynchronous

- **Synchronous** steps (4 to 9) happen **while the user waits**. If any of them throws an error, the whole save is **rolled back** and the user sees the message. This is where validation and "must always be true" logic belongs.
- **Asynchronous** work (11 to 13) happens **after** the save succeeded. It cannot stop the save; if it fails, the row is already saved, and the error appears in the system jobs or the flow's run history. This is where emails, integrations and slow work belong.

## Not every save comes from a form

The same server steps (4 to 13) run when the row is saved by:

- an **import** from Excel or CSV,
- a **cloud flow**,
- an **integration** using the Web API or the SDK,
- **another plug-in**.

But steps 1 to 3 run **only in the form**. That is why a rule written only in JavaScript is not a real rule: an import skips it. Put rules that must always hold on the server (a plug-in or a business rule with *Entity* scope), and use form scripts to make the form friendlier.

## Where to put your logic: a first guide

| You want to… | Use |
| --- | --- |
| Show or hide a field, set a default on the form | Business rule or form script |
| Reject bad data from any source | Synchronous plug-in (or entity-scope business rule) |
| Fill in a value before it is saved | PreOperation plug-in |
| Create related records after the save | PostOperation plug-in |
| Send an email, call another system | Cloud flow or asynchronous plug-in |

## Try it yourself

In your development environment, open a record and press **F12** to open the browser's developer tools. On the **Network** tab, save the record and look for the request to `/api/data/v9.2/…`: that is step 3 sending the change to the server. Its response time is the time the synchronous steps took.
