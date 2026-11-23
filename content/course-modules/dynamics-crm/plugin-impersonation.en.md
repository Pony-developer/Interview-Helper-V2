Every call a plug-in makes runs **as some user**, and Dataverse checks that user's privileges. Choosing that user deliberately is called **impersonation**. Get it wrong and the plug-in either fails for normal users or quietly lets them change data they have no rights to.

## The users in the context

- **`context.InitiatingUserId`**: the person (or application user) who actually started the operation. It never changes along the chain.
- **`context.UserId`**: the user the step runs as. By default it is the calling user, but the step registration can change it.

## Run in User's Context

When you register a step, **Run in User's Context** chooses `context.UserId`:

- **Calling User** (default): the user who triggered the message.
- **A specific user**, for example a dedicated "Integration" or "Plug-in service" user with a narrow security role.

The setting does not change anything by itself; it decides what `context.UserId` holds. Your code then uses it:

```csharp
var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

IOrganizationService asUser   = factory.CreateOrganizationService(context.UserId);           // the step's user
IOrganizationService asCaller = factory.CreateOrganizationService(context.InitiatingUserId); // always the real person
IOrganizationService asSystem = factory.CreateOrganizationService(null);                     // SYSTEM, no privilege checks
IOrganizationService asOther  = factory.CreateOrganizationService(serviceUserId);             // any user id you choose
```

## When to use which

| Need | Service |
| --- | --- |
| Normal work that must respect the user's rights | `context.UserId` |
| Write something the user may not touch: an audit note, a counter, a record in a locked table | `null` (SYSTEM), narrowly |
| Act as a service account with a defined role | a specific user id (from configuration) |
| Record who really did it | read `InitiatingUserId`, whatever service you use |

Records created by a service belong to that service's user unless you set `ownerid`, and `createdby` shows that user. Notes created as SYSTEM show SYSTEM as owner, which is exactly what makes them tamper-proof for normal users.

## Risks of SYSTEM

Running as SYSTEM skips every security check, including business unit and column security. If you read data as SYSTEM and copy it into a record the user can see, you have just leaked it. Use SYSTEM for specific writes, keep the code path small, and never let user input choose which record SYSTEM touches without validation.

## Impersonation from outside

External code can act on behalf of another user too:

- **SDK**: set `serviceClient.CallerId = userId`.
- **Web API**: send the header `CallerObjectId: <Microsoft Entra object id>` (or the older `MSCRMCallerID: <systemuserid>`).

The calling account needs the **Act on behalf of another user** privilege (`prvActOnBehalfOfAnotherUser`). The record then shows the impersonated user in `createdby` and the real caller in **`createdonbehalfby`**, so auditing stays honest.

## In an interview

- Explain the difference between `UserId` and `InitiatingUserId`.
- Explain what "Run in User's Context" changes.
- Give an example where a plug-in should write as SYSTEM, and the risk of doing it everywhere.
- Explain how an integration can create records on behalf of a user and what the audit shows.
