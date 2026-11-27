Read the columns of an account without ever crashing on a missing or empty value.

The program contains a small model of the SDK classes `Entity`, `EntityReference` and `Money`. They behave like the real ones: the indexer `account["x"]` throws when the column is missing, and `GetAttributeValue<T>("x")` returns `default(T)` instead.

Write `Describe.Account(account)` that returns one line:

```text
<name> | <city> | <employees> employees | credit <credit limit> | contact <primary contact>
```

| Part | Column | When missing or empty |
| --- | --- | --- |
| name | `name` (`string`) | `(no name)` |
| city | `address1_city` (`string`) | `-` (also for an empty string) |
| employees | `numberofemployees` (`int`) | `?`, but a real `0` stays `0` |
| credit limit | `creditlimit` (`Money`) | `0` |
| primary contact | `primarycontactid` (`EntityReference`), its `Name` | `none` |

Print the credit limit's `decimal` with `ToString(CultureInfo.InvariantCulture)` so it always uses a dot. Do not change `Main`. Expected output:

```text
Contoso | Kyiv | 500 employees | credit 250000 | contact Olena Koval
Fabrikam | - | ? employees | credit 1500.50 | contact none
(no name) | - | ? employees | credit 0 | contact none
Litware | - | 0 employees | credit 0 | contact none
```

Check the interesting lines: Fabrikam's employee count is in the entity but `null`, so it prints `?`, while Litware really has `0` employees. The third account has no columns at all.

Hint: use `GetAttributeValue<int?>` (with the question mark) to tell empty from zero, and `??` to give defaults: `account.GetAttributeValue<string>("name") ?? "(no name)"`.
