A thermostat has a name and a **target temperature**. The temperature must stay between **5** and **30** degrees (inclusive), and the name cannot be empty. The class below keeps the data in public fields, so any code can write anything, and the error would be found late.

Rewrite `Thermostat` so that it **fails fast**:

- `Name`: a read-only property. The constructor throws an `ArgumentException` if the name is `null`, empty or only spaces;
- `Target`: a property whose setter throws an **`ArgumentOutOfRangeException`** for a value below 5 or above 30. The **old value stays** after a rejected change. The backing field must be `private`;
- the constructor `Thermostat(name, target)`: first checks the name, then sets the target **through the same property**, so that the check is written once;
- the method `Warmer(degrees)`: increases the target by `degrees` (it can be negative) and, if the result is out of the range, throws the same exception and keeps the old value.

Do not change `Main`. Expected output:

```text
Hall: 20
target 40: rejected
20
target 5: accepted
target 4: rejected
5
warmer by 10: accepted
15
warmer by 30: rejected
15
bad target 99
bad name
created Attic
```

The lines in order: the new thermostat; an attempt to set 40 (rejected), and the target is still 20; setting 5 (the limit, accepted); setting 4 (rejected), and the target is 5; warming by 10 (15); warming by 30 (rejected, still 15); the creation of `"Attic"` with the target 99 (a bad target); the creation with an empty name (a bad name); and a correct creation.

Hint: in the constructor, check the name **before** anything else. `string.IsNullOrWhiteSpace(name)` is true for `null`, `""` and `"   "`. Note that `ArgumentOutOfRangeException` is derived from `ArgumentException`: `Main` catches the more specific one first. Because `Warmer` goes through the property, you do not need to repeat the range check there.
