## Task

Two small tools built on attributes.

1. **`Log.Write(message, member, line)`** prints `[member:line] message`. The last two parameters carry `[CallerMemberName]` and `[CallerLineNumber]`, so the **compiler** fills them in with the name of the calling method and the line of the call. You only need to print them.

2. **`Auditor.Report(Type type)`** uses reflection to list the type's **public instance methods declared in that type itself** (not the ones inherited from `object`), sorted by name with `string.CompareOrdinal`. For each method print:
   - `Name: category` when it has an `[Audit]` attribute, with ` (sensitive)` appended if `Sensitive` is true;
   - `Name: not audited` otherwise.

   Hints: `type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)` and `method.GetCustomAttribute<AuditAttribute>()`.

Expected output:

```
[Place:16] placing
[Charge:19] charging
[Ping:21] pong
[Run:26] done
Charge: payments (sensitive)
Ping: not audited
Place: orders
```
