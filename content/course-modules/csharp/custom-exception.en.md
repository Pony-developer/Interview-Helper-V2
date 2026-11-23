A program loads users from lines like `Ann;34`. Write two exception classes and two methods.

1. `ValidationException`: the value of one field is wrong. Its constructor receives the field name and the message. Pass the message to the base class, and save the field in the `Field` property.
2. `LoadException`: a whole line cannot be loaded. Its constructor receives a message and the inner exception: pass **both** to the base class.
3. `ParseAge(string text)` returns the age as a number. It throws `ValidationException` with the field `age` and the message:
   - `is not a number` if the text is not an integer;
   - `must be between 0 and 150` if the number is outside this range.
4. `LoadUser(string line)` splits the line by `;` and returns the parsed age. If `ParseAge` throws a `ValidationException`, it throws a `LoadException` with the message `Cannot load '<line>'` and the original exception as the inner one.

Do not change `Main`: it reads the cause back from `InnerException`. Expected output:

```text
Loaded age 34
Cannot load 'Bob;abc' -> age is not a number
Cannot load 'Eve;200' -> age must be between 0 and 150
```

Hint: a constructor passes values to the base constructor with `: base(...)` after its parameter list. Use `int.TryParse` in `ParseAge`.
