Compiled code does nothing until the platform knows about it. Deploying a plug-in means **registering the assembly**, then **registering a step** that tells the pipeline when to call your class.

## The Plug-in Registration Tool

The **Plug-in Registration Tool** (PRT) is Microsoft's tool for registering assemblies, packages, steps, images, service endpoints, webhooks and Custom APIs. Start it with:

```text
pac tool prt
```

Sign in with **Office 365** and pick the development environment.

## Register the assembly

1. **Register → Register New Assembly**, browse to `bin/Debug/net462/Contoso.Plugins.dll`.
2. The tool lists the `IPlugin` classes it found; keep `HelloWorldPlugin` selected.
3. Isolation mode **Sandbox** and location **Database** are the only choices online.
4. **Register Selected Plugins**.

(A **plug-in package** is registered with **Register New Package** instead.)

## Register the step

Right-click the plug-in type → **Register New Step**:

| Field | Value | Why |
| --- | --- | --- |
| Message | `Create` | Run when a record is created |
| Primary Entity | `account` | Only for accounts |
| Event Pipeline Stage | PreOperation | We change the Target before it is saved |
| Execution Mode | Synchronous | The description must be saved with the record |
| Execution Order | 1 | Order among steps on the same stage |
| Run in User's Context | Calling User | Privileges of whoever creates the account |
| Deployment | Server | Run on the server (Offline is for the old Outlook client) |
| Unsecure / Secure Configuration | empty | Strings passed to the plug-in's constructor |

For Update steps you would also pick **Filtering Attributes**, and add **images** from the step's context menu.

## Test it

1. Open the model-driven app, create an account **Contoso** and save.
2. The description now says `Hello, Contoso! …`.
3. Create an account through another route too (an import, a flow or the Web API): the plug-in runs there as well, because it lives on the server.

## Read the trace log

Turn tracing on in **System Settings** (classic settings: **Administration → System Settings → Customization** tab): set **Enable logging to plug-in trace log** to **All** in development and *Exception* in production. Then open the **Plug-in Trace Log** table (in the app's advanced find, or **Settings → Plug-in trace log**). Each execution shows the message, the stage, the duration and your `Trace` lines. When a synchronous plug-in fails, the user's error dialog also offers a log file with the same lines.

## Change and redeploy

- Rebuild, then in the PRT select the assembly and **Update** it. Steps stay registered as long as the major and minor version have not changed.
- Or from the command line: `pac plugin push --pluginId <assembly id>`.
- Steps can be **disabled** temporarily from the PRT without unregistering them.

## Put it in a solution

Registration only adds components to the environment. To deploy to test and production, add the **plug-in assembly** and **each step** (SDK message processing steps) to your solution. Steps that are not in the solution are simply missing after the import, the most common "it works in dev" problem.

## Debugging

For a hard bug, the PRT's **plug-in profiler** records an execution in the real environment and replays it in Visual Studio with breakpoints. Install the profiler, start profiling the step, reproduce the problem, then **Debug** with the saved profile.

## In an interview

- List the fields of a step and what you would choose for a given requirement.
- Explain how you find out what a plug-in did in production.
- Explain how to update an assembly without losing its steps.
- Explain why a plug-in can work in development and do nothing after a solution import.
