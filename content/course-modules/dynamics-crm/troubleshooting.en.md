"It worked in dev" is where most production incidents begin. A developer who can find out quickly why a plug-in failed, a save is slow or an integration stopped is worth a lot, and interviewers ask for concrete tools, not "I would debug it".

## Read the error properly

A Dataverse fault has an **error code**, a **message** and, in the downloadable log, the call stack. A few codes come up all the time:

| Code | Meaning |
| --- | --- |
| `0x80040265` | A plug-in threw `InvalidPluginExecutionException`: a business error you raised on purpose |
| `0x80040220` | The user is missing a privilege (the message names it, for example `prvReadAccount`) |
| `0x80040217` | The record does not exist (deleted, wrong id or wrong table) |
| `0x80072321`, `0x80072322`, `0x80072326` | Service protection limits were hit; wait for `Retry-After` |
| "Generic SQL error" | Often a time-out or a deadlock in the database; look for long transactions and lock contention |

The message of an unexpected exception inside a plug-in usually hides the real cause. That is why every plug-in should **catch, trace and rethrow** with a clear message.

## Tracing

`ITracingService.Trace()` writes lines that are kept with the execution:

- On an error, the trace is shown in the error dialog's log file and returned to the caller.
- With the environment setting **Enable logging to plug-in trace log** set to *Exception* or *All*, every execution writes a row to the **Plug-in Trace Log** table (`plugintracelog`) with the trace text, the message, the table, the depth, the duration and the exception. *All* is for diagnosis; switch it back, because the rows use log capacity (a system job deletes old ones).

Trace the decisions, not just "entered method": the ids you work with, the branch you took, the values you compared.

## Telemetry in Application Insights

For production, connect the environment to **Application Insights** (data export in the Power Platform admin center). It records plug-in executions, API calls and form loads with durations and failures, so you can chart them, alert on them and query them in KQL. Inside a plug-in, the `ILogger` service (`Microsoft.Xrm.Sdk.PluginTelemetry.ILogger`) writes your own logs and metrics to the same place.

## Debugging plug-ins

You cannot attach a debugger to the cloud sandbox. Instead:

1. Install the **Plug-in Profiler** from the Plug-in Registration Tool and start profiling the step.
2. Reproduce the problem. The profiler captures the execution context, including the target and images, as a profile record.
3. In the Plug-in Registration Tool, **replay** the profile against your local assembly with Visual Studio attached and step through the code with the real data.

Unit tests with a fake context (as in the testable plug-ins lesson) remain the cheapest way to reproduce a bug once you know the input.

## Typical problems and where to look

| Symptom | Look at |
| --- | --- |
| A plug-in fails after about 2 minutes | The sandbox time limit: a slow external call or a huge loop; move the work out of the transaction |
| "Infinite loop" or depth errors | A plug-in or flow updating the record that triggers it; filtering attributes, `context.Depth`, compare before update |
| Something "didn't happen" | System jobs (async plug-ins, workflows), flow run history, the trace log |
| A form is slow | Monitor (in the maker portal, *Monitor* on the app): form load events, network calls, script time |
| Users get "access denied" | The privilege in the message, their roles and business unit, the record's owner and sharing |
| An integration stopped | Service endpoint and Service Bus dead-letter queue, Azure Function logs, expired secrets of the app registration |

## A method that works

1. Reproduce, ideally in a non-production environment with the same data.
2. Read the full error and the trace, not just the first line.
3. Narrow down which component ran: list the steps registered on that table and message, with their stages and order, and the flows and business rules involved.
4. Fix with a test that fails before the fix.

## In an interview

- Explain how tracing works and where the plug-in trace log comes from.
- Describe how to debug a plug-in with the profiler and replay.
- Name typical error codes and what they mean.
- Say what you check when an asynchronous process "didn't happen".
