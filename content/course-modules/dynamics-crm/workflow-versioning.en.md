Workflows are bound to the activities they use. Change an activity carelessly and dozens of workflows break at once. **Assembly versioning** is how you change activities safely.

## How the platform identifies an assembly

A registered assembly is identified by its **name, culture, public key token and version**. For updates, the platform looks at the **major and minor** parts of the version:

- `1.0.0.0` → `1.0.0.7` (build/revision change): an **in-place update**. The same registered assembly gets the new code; every workflow uses it immediately.
- `1.0.0.0` → `1.1.0.0` or `2.0.0.0` (major/minor change): a **new assembly**. Both versions are registered **side by side**; existing workflows keep using the old one, and the designer shows the new one for new steps.

## Safe and breaking changes

| Change | Safe in place? |
| --- | --- |
| Fix a bug inside `Execute` | Yes |
| Add a new **optional** input or a new output | Yes |
| Add a new activity class | Yes |
| Rename, remove or retype an argument | **No**: workflows that set it break |
| Make an input required | **No** for workflows that leave it empty |
| Rename or move the class (namespace) | **No**: workflows refer to the type name |

## Making a breaking change

1. Raise the **minor** (or major) version: `1.0.0.0` → `1.1.0.0`.
2. Register it as a **new assembly**; the old version stays.
3. Update workflows one by one: deactivate, replace the step with the new version's step, set its properties, activate.
4. When nothing uses the old version any more (check dependencies in the PRT or the solution), unregister it.

An alternative that avoids a second assembly: keep the old activity class unchanged and add a **new class** (`GetConfigurationValueV2`) for the new behaviour. Many teams prefer this: one assembly, two activities, a clear migration path.

## Versions and solutions

- The assembly version and the **solution version** are independent. Bump the solution on every release; change the assembly's major/minor only for breaking activity changes.
- Plug-in steps work the same way: they are tied to the plug-in type in a specific assembly version, which is why many teams keep plug-in assemblies at `1.0.0.x` and change only the build number.
- Strong-name key, name and culture must stay the same, or the platform treats it as a different assembly altogether.

## Practical rule

Keep the assembly at `1.0.x.x`, never rename or remove arguments, add new optional ones instead, and introduce a new class when behaviour must change incompatibly. Use a side-by-side version only when you truly cannot avoid it.

## In an interview

- Explain which version changes update an assembly in place and which create a new one.
- List changes to an activity that break existing workflows.
- Describe how to roll out a breaking change without stopping existing workflows.
- Explain how assembly and solution versions relate.
