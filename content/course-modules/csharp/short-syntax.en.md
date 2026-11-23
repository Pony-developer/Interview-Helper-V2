The class `Person` below is written the long way: private fields, a constructor, and separate `Get` methods. `Main` uses it the **modern** way, with an **object initializer** (`new Person { Name = "Ann", BirthYear = 1990 }`) and with properties, so the program does not compile.

Rewrite `Person` with the short syntax:

- `Name` and `BirthYear` are **auto-properties** with `get` and `set`;
- `Greeting` is a **read-only computed property** written with `=>`: it returns `"Hello, " + Name + "!"`;
- `AgeIn(year)` is a method written with `=>`: the year minus the birth year.

No constructor is needed: C# supplies the empty one, and the object initializer fills the properties. The whole class should be only a few lines. Do not change `Main`. Expected output:

```text
Hello, Ann!
36
Hello, Anna!
0
2000
```

The lines in order: the greeting for Ann; her age in 2026; the greeting after the name was changed to `Anna`; the birth year of a person for whom it was not set (an unset `int` property is 0); and the "age" in the year 2000 for that person.

Hint: `public string Name { get; set; }`, `public string Greeting => "Hello, " + Name + "!";`. Because `Greeting` is computed on every read, it follows the change of `Name` by itself.
