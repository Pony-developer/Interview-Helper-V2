## Task

`Resources` stores strings per culture name, with `""` meaning the invariant (neutral) resources, the ones that live in the main assembly. Implement **`Get(key, culture)`** so it behaves like `ResourceManager` with satellite assemblies:

1. Start with the given culture and walk up its **parent chain** with `CultureInfo.Parent`: `uk-UA` → `uk` → invariant (whose `Name` is `""`). The invariant culture's parent is itself, so stop after checking it.
2. At each step, if a table exists for that culture name and it contains the key, return the value.
3. If nothing is found anywhere, return `"[key]"` (the brackets make missing translations easy to spot on screen).

Note that `de-AT` finds `Warenkorb` through its parent `de`, while `fr-FR` has no French resources and falls back to the neutral English ones.

The last line of `Main` parses a full assembly name with `AssemblyName`.

Expected output:

```
uk-UA: Вітаємо / Кошик / Checkout / [Missing]
uk: Привіт / Кошик / Checkout / [Missing]
de-AT: Hello / Warenkorb / Checkout / [Missing]
fr-FR: Hello / Cart / Checkout / [Missing]
Shop.Core 2.1.0.7 major=2 culture=''
```
