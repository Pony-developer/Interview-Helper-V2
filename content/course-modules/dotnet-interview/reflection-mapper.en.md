## Task

Question 84: "What is reflection?" Two things almost every project needs and that libraries do with reflection: mapping an entity to a DTO and printing an object for logs while hiding sensitive fields.

1. **`Mapper.Map<TSource, TTarget>(source)`** — create `new TTarget()` (the `new()` constraint allows it). For every public instance property of `TSource` that can be read, find a public property of `TTarget` with the same name that can be written and whose type **is assignable from** the source property's type (`to.PropertyType.IsAssignableFrom(from.PropertyType)`), and copy the value. Others are skipped — here `CreatedAt` is a `DateTime` in `User` but a `string` in `UserDto`.
2. **`Mapper.Describe(obj)`** — one line `"Name: TypeName = value"` per public instance property, **ordered by name** (ordinal). `TypeName` is `PropertyType.Name` (`Int32`, `String`, …). The value is `"null"` for null, `"***"` if the property has the `[Sensitive]` attribute (`GetCustomAttribute<SensitiveAttribute>()`), otherwise `Convert.ToString(value, CultureInfo.InvariantCulture)`.

Expected output:

```
CreatedAt: DateTime = 05/04/2026 10:30:00
Email: String = ann@shop.ua
Id: Int32 = 7
Name: String = Ann
PasswordHash: String = ***
---
CreatedAt: String = null
Email: String = ann@shop.ua
Id: Int32 = 7
IsAdmin: Boolean = False
Name: String = Ann
```
