Model-driven apps update several times a year without asking you. Scripts that use only **supported** APIs keep working; scripts that rely on internals break on a Tuesday morning. This lecture is about writing scripts that survive.

## Supported vs unsupported

**Supported**: everything documented in the Client API reference: `executionContext`, `formContext`, `Xrm.*`, and the Web API.

**Unsupported**, and a common cause of outages after updates:

- reading or changing the form's **HTML** (`document.getElementById`, `querySelector`, jQuery on form elements, injected CSS);
- calling **undocumented** functions or objects you found in the page's scripts;
- relying on the **order** in which the platform loads its own resources;
- reaching into `parent` or `top` windows to grab internal objects.

If a requirement seems to need any of these, look for a supported alternative: a PCF control, a custom page, a command, a business rule.

## Deprecated APIs to replace

| Deprecated | Use instead |
| --- | --- |
| `Xrm.Page` | `executionContext.getFormContext()` / `primaryControl` |
| `Xrm.Utility.alertDialog`, `confirmDialog` | `Xrm.Navigation.openAlertDialog`, `openConfirmDialog` |
| `Xrm.Utility.openEntityForm`, `openWebResource` | `Xrm.Navigation.openForm`, `navigateTo` |
| `context.getUserRoles()` | `Xrm.Utility.getGlobalContext().userSettings.roles` |
| `context.getServerUrl()` | `getClientUrl()` |
| Synchronous `XMLHttpRequest`, the SOAP endpoint from JavaScript | `Xrm.WebApi` / `fetch` to the Web API |
| `parent.Xrm` from HTML web resources | Pass `Xrm` and the form context in via `getContentWindow()` |

Microsoft publishes a list of deprecated client APIs with each release; the **solution checker** flags many of these patterns automatically. Make it part of your pipeline.

## Localization

Users see the app in their language; your messages should follow.

1. Create **RESX** web resources per language: `contoso_/strings/account.1033.resx` (English), `contoso_/strings/account.1058.resx` (Ukrainian).
2. Add them as **dependencies** of the script's library in the form's or web resource's properties.
3. Read strings by key:

```javascript
const text = Xrm.Utility.getResourceString("contoso_/strings/account", "CreditHold");
formContext.ui.setFormNotification(text, "WARNING", "credit-hold");
```

The platform picks the file for the user's language (`userSettings.languageId`), falling back to the base language. Format numbers and dates with `Intl` or the user's settings, never by concatenating strings.

## Accessibility

Use platform notifications and dialogs instead of custom pop-ups: they work with screen readers and keyboard navigation. In HTML web resources and PCF controls, label inputs, support the keyboard and respect high-contrast themes.

## Ownership and documentation

Each script should say, in a comment or a README, which events and forms it is registered on. Use **attribute dependencies** in the form's event handler properties for columns the script needs, so nobody can remove those columns from the form without seeing the warning.

## In an interview

- Give three examples of unsupported client-side customizations and supported alternatives.
- Name deprecated client APIs and their replacements.
- Explain how to localize messages in form scripts.
- Explain how attribute dependencies protect a script.
