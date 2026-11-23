The last lecture of the client-side part puts the pieces together in one feature, the way it would be built on a real project: **an account credit check**.

## The requirement

Sales reps want a **Check credit** button on the account form. It asks an external credit agency for a score, stores the result on the account, warns the rep if the account should be put on hold, and shows the details in a dialog. Managers want the same check to be usable from flows later.

## The design

```text
 Account form ──Check credit (command)──▶ contoso_/scripts/account.js
                                          │ Xrm.WebApi.online.execute
                                          ▼
                          Custom API contoso_CheckCredit (bound to account, action)
                                          │ plug-in: calls the agency over HTTPS,
                                          │ writes contoso_creditscore, contoso_creditcheckedon
                                          ▼
                          Response: score, approved, message
                                          │
 Form notification + refresh ◀────────────┘──▶ dialog: contoso_/html/creditdetails.html
```

Why these pieces:

- **Custom API**: the logic lives on the server, under the platform's security, reusable by flows, other apps and integrations. The external call and its credentials stay out of the browser.
- **Plug-in** behind the Custom API: short HTTPS call with a timeout, credentials from a secret environment variable, result written to the account in the same operation.
- **Command** (modern commanding) on the form: visible only for existing, active accounts.
- **Form script**: progress indicator, the request, a notification and a refresh.
- **HTML web resource** dialog for the details (a custom page would work too).

## The command handler

```typescript
namespace Contoso.Account {
  export async function checkCredit(primaryControl: Xrm.FormContext): Promise<void> {
    const fc = primaryControl;
    if (fc.data.entity.getIsDirty()) await fc.data.save();          // the server must see current data
    const accountId = fc.data.entity.getId().replace(/[{}]/g, "");

    Xrm.Utility.showProgressIndicator("Checking credit…");
    try {
      const response = await Xrm.WebApi.online.execute(checkCreditRequest(accountId));
      const result = await response.json();                         // { Score, Approved, Message }

      fc.ui.clearFormNotification("credit");
      if (!result.Approved) {
        fc.ui.setFormNotification(`Credit check failed: ${result.Message}`, "WARNING", "credit");
      }
      await fc.data.refresh(false);                                 // show the stored score

      await Xrm.Navigation.navigateTo(
        { pageType: "webresource", webresourceName: "contoso_/html/creditdetails.html", data: JSON.stringify(result) },
        { target: 2, position: 1, width: { value: 480, unit: "px" }, height: { value: 360, unit: "px" }, title: "Credit check" });
    } catch (e) {
      await Xrm.Navigation.openErrorDialog({ message: "The credit check could not be completed.", details: String(e) });
    } finally {
      Xrm.Utility.closeProgressIndicator();
    }
  }

  function checkCreditRequest(accountId: string) {
    return {
      entity: { entityType: "account", id: accountId },
      getMetadata: () => ({
        boundParameter: "entity",
        operationType: 0,
        operationName: "contoso_CheckCredit",
        parameterTypes: { entity: { typeName: "mscrm.account", structuralProperty: 5 } },
      }),
    };
  }
}
```

In the command designer, the button's **visibility** is a Power Fx formula that checks the record is saved and active; its action runs the JavaScript function `Contoso.Account.checkCredit` with `PrimaryControl` as its parameter.

## The form script on load

```typescript
export function onLoad(executionContext: Xrm.Events.EventContext): void {
  const fc = executionContext.getFormContext();
  const checkedOn = fc.getAttribute<Xrm.Attributes.DateAttribute>("contoso_creditcheckedon")?.getValue();
  const stale = !checkedOn || Date.now() - checkedOn.getTime() > 90 * 24 * 3600 * 1000;
  if (stale && fc.ui.getFormType() === 2) {
    fc.ui.setFormNotification("The credit check is older than 90 days.", "INFO", "credit-stale");
  }
}
```

## What makes it production-ready

- **Solution**: Custom API, plug-in assembly and step, script, HTML page, RESX strings, command, environment variables. One solution, deployed by the pipeline.
- **Security**: a privilege on the Custom API so only sales roles can run it; credentials never in the browser.
- **Errors**: the plug-in throws `InvalidPluginExecutionException` with a readable message; the script shows it in an error dialog.
- **Tests**: plug-in logic unit tested with a fake service; the script's logic tested with mocks.
- **Localization**: messages from RESX files; numbers formatted for the user.
- **Performance**: nothing runs on load except a local date check.

This is the shape of most real Dynamics features: a small amount of client code for the experience, server code for the rules, and the platform's pieces (commands, Custom APIs, solutions) holding it together.

## In an interview

- Design a feature that calls an external service from a form, and explain where each part runs.
- Explain why the call goes through a Custom API instead of `fetch` from the browser.
- Walk through the command handler: saving, progress, request, notification, refresh, dialog.
- List what goes into the solution for this feature.
