A custom activity is deployed much like a plug-in, but there are **no steps** to register: the workflow designer is where it gets wired in.

## Register the assembly

1. Build the project.
2. In the **Plug-in Registration Tool**, **Register New Assembly** (or update the existing one if activities live next to plug-ins).
3. The tool lists the classes it found: `IPlugin` classes and `CodeActivity` classes. Select the activity.
4. Isolation **Sandbox**, location **Database**.

## Name it for the designer

Select the activity type in the PRT and set:

- **Name** / **Friendly name**: what admins see as the step name, e.g. "Get configuration value".
- **Workflow Activity Group Name**: the submenu the step appears in, e.g. "Contoso Tools". Put all your activities in one or two groups so admins find them.
- **Description**.

## Use it in a workflow

1. In the maker portal, open **Solutions → your solution → New → Automation → Process → Workflow** (or open classic settings → Processes).
2. Choose the table, the scope and when it starts (record created, field changes, on demand), and whether it runs as a **background** or **real-time** workflow.
3. **Add Step → Contoso Tools → Get configuration value.**
4. **Set Properties**: fill the inputs with fixed text or dynamic values from the record.
5. Use the outputs in later steps: in a condition ("Get configuration value: Found equals Yes") or in a field value ("Value").
6. **Activate** the workflow.

## Ship it

Add to your solution:

- the **plug-in assembly** that contains the activity;
- the **workflows** (processes) that use it;
- the configuration table and its app, if part of the feature.

Import order is handled by the solution, but a workflow that references an activity must have that assembly in the same or an earlier solution, otherwise the import fails on a missing dependency. Workflows arrive **activated** if they were active when exported; check their owners in the target environment, because background workflows run as their owner.

## Updating

- Rebuild and **Update** the assembly in the PRT. With the same major and minor version, existing workflows pick up the new code immediately.
- Adding an argument is safe; renaming or removing one, or changing its type, breaks workflows that use it. Such changes need a new version (see the versioning lecture).
- Some changes are only picked up after the workflow is deactivated and activated again, so do that in development to be sure.

## In an interview

- Describe the steps from a compiled activity to a running workflow.
- Explain what the workflow activity group name is.
- Explain what has to be in the solution for the workflows to import.
- Explain which changes to an activity are safe and which break existing workflows.
