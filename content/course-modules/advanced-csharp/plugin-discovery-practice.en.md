## Task

Implement **`RuleLoader.Discover(assembly)`**, the core of a plug-in system: find all discount rules in an assembly by reflection.

A type is a rule when it is:

- a **class** that isn't **abstract** (`BaseRule` must be skipped: it can't be instantiated);
- assignable to **`IDiscountRule`** (`typeof(IDiscountRule).IsAssignableFrom(t)`);
- marked with **`[Rule(order)]`** (`Unordered` implements the interface but has no attribute, so it's ignored).

Create an instance of each with `Activator.CreateInstance`, and return them sorted by the attribute's `Order`.

The end of `Main` shows invoking a method through reflection: `MethodInfo.Invoke` with an `object[]` of arguments returns a boxed result.

Expected output:

```
MinusFive -> TenPercentOff -> RoundDown
MinusFive: 115
TenPercentOff: 103.5
RoundDown: 103
Decimal 180.0
```
