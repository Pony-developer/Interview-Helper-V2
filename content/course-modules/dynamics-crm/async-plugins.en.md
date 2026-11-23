An **asynchronous** plug-in step does not run while the user waits. The platform saves the record, queues a **system job**, and the **asynchronous service** runs your plug-in shortly afterwards. It is the right tool for work that must happen but does not need to block the save.

## Registering

In the Plug-in Registration Tool choose **Execution Mode: Asynchronous**. Only **PostOperation** steps can be asynchronous: there is nothing to do asynchronously before the save. In code, `context.Mode` is `1` for asynchronous and `0` for synchronous.

## What changes

| | Synchronous PostOperation | Asynchronous |
| --- | --- | --- |
| User waits | Yes | No |
| Transaction | Same as the save | Its own, after the save is committed |
| Throwing an exception | Rolls back the save; user sees the message | Save stays; the system job fails |
| Order | Rank order, immediate | Queued; order between jobs is not guaranteed |
| Images | Pre and post | Pre and post (captured at the time of the operation) |
| Where failures show | Error dialog, trace log | **System Jobs** (`asyncoperation`), trace log |

## Good uses

- Calling external systems: ERP, email services, document generation.
- Heavy recalculation over many related records.
- Notifications that can arrive a few seconds later.
- Anything where a failure should not stop the user's save.

## Things to design for

- **No user feedback**: the user never sees your exception. Monitor failed system jobs, or write a status column on the record ("Sync failed: …") that users can see.
- **Stale data**: by the time the job runs, the record may have changed again. Re-read what you need (or use the images knowingly) and avoid overwriting newer values.
- **Ordering**: two quick updates create two jobs, and they may finish out of order. Make the work idempotent, or compare a version or modified-on timestamp.
- **Retries**: the platform retries some transient failures; your code may run more than once for the same event.
- **Volume**: every async step adds rows to `asyncoperation`. Tick **Delete AsyncOperation if StatusCode = Successful** on the step so successful jobs are cleaned up, otherwise the table grows by millions of rows.
- **Bulk loads**: a data import of 100,000 records queues 100,000 jobs per async step, and they share the queue with everything else in the environment. Plan for it, or disable non-essential steps during migrations.

## Async plug-in, flow or service endpoint?

- **Async plug-in**: C# logic that runs inside Dataverse, with images and the organization service at hand.
- **Power Automate flow**: when makers should own the logic or it is mostly calls to connectors.
- **Service endpoint (Service Bus, webhook)**: when the work belongs in another system or in Azure, with its own scaling and retries. The platform just posts the context.

## In an interview

- Explain what happens between saving a record and an asynchronous plug-in running.
- Compare synchronous and asynchronous steps: transaction, errors, ordering.
- Explain how you would make users aware of failures in async work.
- Explain the system job clean-up option and why it matters.
