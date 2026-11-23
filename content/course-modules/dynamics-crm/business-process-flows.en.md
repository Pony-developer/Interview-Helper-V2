**Business process flows** (BPFs) guide users through stages (Qualify → Develop → Propose → Close) with the steps to complete in each. They are configured without code, but the Client API lets scripts read the process, react to stage changes and block moves that are not ready.

## The process API

```javascript
const process = formContext.data.process;

const active = process.getActiveProcess();        // { getId(), getName(), getStages() }
const stage = process.getActiveStage();           // { getId(), getName(), getStatus(), getSteps() }
const selected = process.getSelectedStage();      // the stage the user clicked on (may differ)
const path = process.getActivePath();             // stages on the current branch

process.moveNext(result => {                      // "success", "crossEntity", "end", "invalid", "dirtyForm"…
  if (result !== "success") Xrm.Navigation.openAlertDialog({ text: "Could not move: " + result });
});
process.movePrevious(result => { /* same results */ });
process.setActiveStage(stageId);
process.setStatus("finished");                    // "active" | "aborted" | "finished"
```

Stage changes save the BPF instance; make sure the form is not dirty with invalid data first.

## Reacting and blocking

```javascript
function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  fc.data.process.addOnPreStageChange(beforeStageChange);
  fc.data.process.addOnStageChange(afterStageChange);
  fc.data.process.addOnStageSelected(stageSelected);
}

function beforeStageChange(executionContext) {
  const args = executionContext.getEventArgs();
  const fc = executionContext.getFormContext();
  if (args.getDirection() === "Next" && !fc.getAttribute("contoso_budgetapproved").getValue()) {
    args.preventDefault();
    Xrm.Navigation.openAlertDialog({ text: "Approve the budget before moving on." });
  }
}

function afterStageChange(executionContext) {
  const stage = executionContext.getEventArgs().getStage();
  const fc = executionContext.getFormContext();
  fc.ui.tabs.get("tab_proposal").setVisible(stage.getName() === "Propose");
}
```

- **`addOnPreStageChange`** runs *before* the move and can cancel it with `preventDefault()`; `getDirection()` is `"Next"` or `"Previous"`.
- **`addOnStageChange`** runs *after* the move; use it to adapt the form to the new stage.
- **`addOnStageSelected`** runs when the user clicks a stage to look at it, without moving.
- **`addOnProcessStatusChange`** runs when the process is finished or abandoned.

## Fields in the process bar

Steps in the BPF are controls named `header_process_<column>`. They share the attribute with any copy in the form body, so `setValue` on the attribute updates both, but visibility and locking are per control. To lock a field everywhere, loop over `attribute.controls`.

## The process UI

`formContext.ui.process.setVisible(false)` hides the bar; `setDisplayState("collapsed" | "expanded" | "floating")` changes how it is shown.

## Keep rules on the server too

A pre-stage-change check is a guide for users. If "Develop requires an approved budget" is a hard rule, also enforce it on the server: BPF instances are records of their own table (for example `opportunitysalesprocess`), and a plug-in on its Update (`activestageid`) can reject an invalid move from any client.

## In an interview

- Show how to read the active stage and move to the next one.
- Show how to block a stage change and explain which event to use.
- Explain how BPF fields relate to the form's attributes and controls.
- Explain how to enforce a stage rule on the server.
