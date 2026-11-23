## Summary of the module

- A **delegate** is a type for a method with a given signature. A variable of that type holds a method, and calling the variable calls the method. Delegates let the program pass behaviour as a value.
- A delegate is an **object** on the heap, with a method and a target. Assignment copies the reference. A combined delegate is a new object.
- **Generic delegates** (`Func`, `Action`, `Predicate`, `Comparison`) cover most cases, so you rarely need to declare your own type.
- **Lambda expressions** (`x => x * 2`) are the short way to write a delegate, and most code uses them. Anonymous methods (`delegate { }`) are the older form.
- A lambda that uses an outside local variable is a **closure**. The variable is captured by reference, and it lives as long as the delegate.
- The most common mistake is capturing a `for` loop variable. Copy the value into a new local variable inside the loop.

## Choosing the tool

| Need | Tool |
|---|---|
| Pass a rule to a method | a delegate parameter, usually `Func` or `Action` |
| A short rule used once | a lambda expression |
| A named rule used in many places | a method, converted to a delegate |
| A table of named behaviours | a `Dictionary` of delegates |
| A rule that remembers some data | a closure, or a method of an object |
| A rule that must be checked by the compiler | a named delegate type, such as `Operation` |
