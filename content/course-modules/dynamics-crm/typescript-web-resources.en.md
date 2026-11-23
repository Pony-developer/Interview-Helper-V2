A few lines of JavaScript pasted into the web resource editor work for a demo. Real projects have dozens of scripts maintained for years by several people; they need types, a build and source control.

## Write TypeScript

```bash
npm install --save-dev typescript @types/xrm esbuild
```

`@types/xrm` describes the whole Client API, so the editor completes `formContext.getAttribute(...)` and the compiler catches typos and wrong value types:

```typescript
namespace Contoso.Account {
  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    const industry = fc.getAttribute<Xrm.Attributes.OptionSetAttribute>("industrycode");
    industry?.addOnChange(onIndustryChange);
    onIndustryChange(executionContext);
  }

  function onIndustryChange(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    const isPublic = fc.getAttribute<Xrm.Attributes.OptionSetAttribute>("industrycode")?.getValue() === 7;
    fc.getControl<Xrm.Controls.StandardControl>("contoso_procurementcode")?.setVisible(isPublic);
  }
}
```

## Bundle to one file per table

The form loads web resources as plain scripts, so the output must be one file that puts your functions on a **global name** used in the event handler (`Contoso.Account.onLoad`). With ES modules and a bundler:

```bash
esbuild src/account/index.ts --bundle --format=iife --global-name=Contoso.Account --minify --outfile=dist/contoso_/scripts/account.js
```

Webpack and Rollup work too. Keep one bundle per table (or per form), not one giant library for everything: every form would load code it never uses.

## Naming and structure

- Web resource names include the publisher prefix and a virtual folder: `contoso_/scripts/account.js`, `contoso_/html/creditcheck.html`, `contoso_/strings/account.1033.resx`.
- One namespace for the company or product (`Contoso`), sub-namespaces per table.
- Shared helpers (Web API wrappers, notification helpers) in a common library listed as a **dependency** of each table's script.

## Deploy from the build

Web resources are solution components, so the built files must end up in the solution:

- with `pac solution clone`/`sync`, web resources are files in the solution folder: the build copies the bundles there and `pac solution pack` packs them;
- during development, tools such as the *Dataverse DevTools* VS Code extension, XrmToolBox's *WebResources Manager* or *spkl* upload and publish a changed file in seconds.

Never edit the deployed, minified file in the environment: the next deployment overwrites it, and the change is lost from source control.

## Lint and format

ESLint (with rules against `Xrm.Page` and `document` access) and Prettier keep scripts consistent and catch unsupported patterns in review, before they reach users.

## In an interview

- Explain what `@types/xrm` gives you.
- Explain how a bundled module becomes a function the form can call.
- Describe how web resources get from source control into a solution.
- Explain why editing scripts directly in the environment is a problem.
