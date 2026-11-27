Let's write, upload and test a real form script. The goal: on the account form, when **Credit Limit** is above 100,000, make **Payment Terms** required and show a notification; otherwise make it optional again.

## 1. Write the script

Create a file `contoso_account.js`:

```javascript
var Contoso = Contoso || {};

Contoso.Account = {
    onLoad: function (executionContext) {
        Contoso.Account.applyCreditRules(executionContext.getFormContext());
    },

    onCreditLimitChange: function (executionContext) {
        Contoso.Account.applyCreditRules(executionContext.getFormContext());
    },

    applyCreditRules: function (formContext) {
        const credit = formContext.getAttribute("creditlimit").getValue();   // a number or null
        const terms = formContext.getAttribute("paymenttermscode");

        if (credit !== null && credit > 100000) {
            terms.setRequiredLevel("required");
            formContext.ui.setFormNotification("High credit limit: payment terms are required.", "WARNING", "credit");
        } else {
            terms.setRequiredLevel("none");
            formContext.ui.clearFormNotification("credit");
        }
    },
};
```

Notice: the logic lives in one function, `applyCreditRules`, called both on load (for existing records) and on change (while the user edits). The notification has an id, `"credit"`, so it can be cleared later.

## 2. Upload it as a web resource

1. In your solution: **New** → **More** → **Web resource**.
2. Upload the file, display name "Account form script", name `contoso_/scripts/account.js`, type **JavaScript (JS)**.
3. **Save** and **Publish**.

## 3. Attach it to the form

1. Open the account **Main** form in the form designer.
2. In **Form libraries**, add `contoso_/scripts/account.js`.
3. Select the form, go to **Events** → **On Load** → **+ Event handler**: library `contoso_/scripts/account.js`, function `Contoso.Account.onLoad`, tick **Pass execution context as first parameter**.
4. Select the **Credit Limit** column, **Events** → **On Change**: function `Contoso.Account.onCreditLimitChange`, also with the execution context.
5. **Save and publish**.

## 4. Test it

Open an account, type 150,000 in Credit Limit and leave the field: the warning appears and Payment Terms gets a red asterisk. Set it to 50,000: both disappear. Try to save with 150,000 and no payment terms: the form refuses.

If nothing happens, press **F12**, look at the **Console** for errors, and check that the function names in the handlers match exactly, including upper and lower case.

## 5. Remember the server

This rule lives only in the form. An Excel import or an integration can still save an account with a high credit limit and no payment terms. If the rule must always hold, add the same check to a synchronous plug-in, or build it as a business rule with *Entity* scope.

## Ideas to practise next

- Hide the **Payment Terms** section entirely for accounts of type *Competitor* (`formContext.ui.tabs.get(…).sections.get(…).setVisible(false)`).
- Show the number of characters left in a description field on each change.
- Set **Credit Limit** to 0 by default on a new account (`formContext.ui.getFormType() === 1` means Create).
