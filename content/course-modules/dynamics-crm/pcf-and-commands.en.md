When standard controls and a few lines of script are not enough, you build **code components** with the Power Apps component framework (PCF) and customise the **command bar**.

## PCF controls

A PCF control replaces how a column or a grid is shown: a star rating instead of a number, a map instead of an address, a Kanban board instead of a list. Controls are written in **TypeScript** (often with React and Fluent UI), run in the browser, and work in model-driven apps, canvas apps and Power Pages.

Two kinds:

- **Field** controls bind to one or more columns: `pac pcf init --namespace Contoso --name StarRating --template field`.
- **Dataset** controls bind to a view or subgrid: `--template dataset`.

The manifest (`ControlManifest.Input.xml`) declares the properties, their types and the resources. The class implements four methods:

```typescript
export class StarRating implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private value: number | null = null;
  private notifyOutputChanged!: () => void;
  private container!: HTMLDivElement;

  init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void,
       state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
  }

  updateView(context: ComponentFramework.Context<IInputs>): void {
    this.value = context.parameters.rating.raw;   // called whenever data or layout changes
    this.render(context.mode.isControlDisabled);
  }

  getOutputs(): IOutputs {
    return { rating: this.value ?? undefined };   // the platform reads the new value here
  }

  destroy(): void { /* remove listeners, unmount React */ }

  private render(disabled: boolean) { /* draw stars; on click: set this.value, call notifyOutputChanged() */ }
}
```

The cycle: the platform calls `init` once, then `updateView` every time something changes. When the user changes the value, the control calls `notifyOutputChanged()`, and the platform calls `getOutputs()` to read the new value. The `context` also gives access to `webAPI`, `navigation`, `formatting`, `resources` (translations) and device features.

Develop with `npm start watch` (a local test harness), then package: `pac solution init`, `pac solution add-reference`, build, and import the solution. During development `pac pcf push --publisher-prefix contoso` deploys straight to an environment.

## Commands

The command bar (formerly the **ribbon**) holds the buttons above forms and grids.

- **Modern commanding**: in the app designer's command designer, add buttons whose action and visibility are **Power Fx** formulas, or that call a JavaScript function. This is the current way.
- **Classic ribbon customisation** edits `RibbonDiffXml`, usually with the community **Ribbon Workbench** in XrmToolBox. You still meet it in older systems: commands, enable rules and display rules.

A JavaScript command receives parameters you configure, such as `PrimaryControl` (the form context of the current record) or `SelectedControlSelectedItemIds` (the ids selected in a grid):

```javascript
Contoso.Account.markVip = async function (primaryControl) {
  const formContext = primaryControl;
  formContext.getAttribute("contoso_isvip").setValue(true);
  await formContext.data.save();
};
```

## Other web resources

Web resources can also be HTML pages, CSS, images (SVG, PNG) and RESX files for translations. Custom HTML pages embedded in forms are an older pattern; for new UI, prefer PCF controls or **custom pages** (canvas pages embedded in model-driven apps).

## Choosing

| Need | Tool |
| --- | --- |
| Show, hide, require on a form | Business rule, then form script |
| A different way to display or edit a column | PCF field control |
| A custom grid or board | PCF dataset control |
| A new button with simple logic | Modern command with Power Fx |
| A whole new screen | Custom page or PCF |

## In an interview

- Explain field vs dataset PCF controls and the four lifecycle methods.
- Explain how a control reports a new value to the platform.
- Describe how a PCF control is built and deployed with `pac`.
- Compare modern commanding with classic ribbon customisation.
