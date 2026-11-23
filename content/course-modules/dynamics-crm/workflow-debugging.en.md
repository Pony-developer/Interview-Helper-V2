Workflow activities fail in places you cannot see: inside the asynchronous service at 3 a.m., or for one record out of thousands. Debugging them is about collecting evidence first.

## Where errors show up

- **Real-time workflows**: the user gets an error dialog with your `InvalidPluginExecutionException` message, and a log file with the trace.
- **Background workflows**: nothing happens on the screen. Open **System Jobs** (or the record's **Background processes** / Process sessions), find the failed job, and read its message and details. The process session shows which step failed and the values it used.
- **Plug-in trace log**: activities write to it through `ITracingService`, like plug-ins, when tracing is enabled.

## Trace what matters

```csharp
tracing.Trace("Key={0}, user={1}, record={2}", key, context.UserId, context.PrimaryEntityId);
tracing.Trace("Rows found: {0}", rows.Count);
```

Trace the inputs, the decisions and the outputs. When a background job fails, the trace is often the only record of what the code saw.

## The plug-in profiler

The **Plug-in Registration Tool** profiler works for custom activities too:

1. **Install Profiler** in the environment.
2. Select the activity and choose **Profile Workflow**. The tool makes a copy of the workflow that runs the activity with profiling.
3. Trigger the workflow on a record. The profiler stores the execution (context, inputs, service responses) in a profile record.
4. In the PRT choose **Debug**, select the profile and attach Visual Studio to the PRT process. You can now step through `Execute` with the real data, replayed locally.
5. Uninstall the profiler when you are done.

## Unit tests first

Most bugs can be reproduced faster in a unit test: give the activity the inputs from the failed job, a fake organization service with the relevant records, and run it. FakeXrmEasy supports `CodeActivity`; a small harness works too. A test that reproduces a production bug is the best fix you can ship with it.

## Common causes

- **Missing input**: a dynamic value was empty for this record (the lookup was not filled). Check inputs for `null` before using them.
- **Wrong user**: a background workflow runs as its owner, who may lack privileges or be disabled.
- **Inactive or duplicate data**: configuration rows deactivated or duplicated.
- **Version mismatch**: the workflow is bound to an older assembly version than you think.
- **Time zones**: `DateTime` values are UTC; date-only columns and user-local times confuse calculations.
- **Timeouts**: the 2-minute sandbox limit applies to each activity execution too.

## In an interview

- Explain where you look when a background workflow fails.
- Describe how to debug a custom activity with the profiler.
- Explain why a background workflow can fail for permissions even though the user who triggered it has them.
- List common causes of activity failures.
