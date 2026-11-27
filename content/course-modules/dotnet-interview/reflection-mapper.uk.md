## Завдання

Питання 84: «Що таке рефлексія?» Дві речі, потрібні майже в кожному проєкті, які бібліотеки роблять рефлексією: відображення сутності на DTO і друк об'єкта для логів із приховуванням чутливих полів.

1. **`Mapper.Map<TSource, TTarget>(source)`** — створіть `new TTarget()` (це дозволяє обмеження `new()`). Для кожної публічної властивості екземпляра `TSource`, яку можна прочитати, знайдіть публічну властивість `TTarget` з тією самою назвою, яку можна записати і чий тип **сумісний для присвоєння** з типом властивості джерела (`to.PropertyType.IsAssignableFrom(from.PropertyType)`), і скопіюйте значення. Інші пропускаються — тут `CreatedAt` у `User` має тип `DateTime`, а в `UserDto` — `string`.
2. **`Mapper.Describe(obj)`** — по рядку `"Name: TypeName = value"` на кожну публічну властивість екземпляра, **упорядковано за назвою** (ordinal). `TypeName` — це `PropertyType.Name` (`Int32`, `String`, …). Значення — `"null"` для null, `"***"`, якщо властивість має атрибут `[Sensitive]` (`GetCustomAttribute<SensitiveAttribute>()`), інакше `Convert.ToString(value, CultureInfo.InvariantCulture)`.

Очікуваний вивід:

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
