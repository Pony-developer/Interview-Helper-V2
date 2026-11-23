The program already contains a tiny test framework (`[Fact]`, `[Theory]`, `[InlineData]` and `Assert.Equal`, which throws an `AssertException`) and a test class `CartTests`. What is missing is the **runner**. Write `Run(Type testClass)`, which works the way xUnit does:

- Find the public methods of the class (`testClass.GetMethods()`) and go through them **sorted by name** with `StringComparer.Ordinal`. Methods without a test attribute are not tests.
- A method with `[Fact]` whose `Skip` is set is not run: print `SKIP <name>: <reason>`.
- Any other `[Fact]` is one test called `<name>`.
- A `[Theory]` gives one test for every `[InlineData]` (`method.GetCustomAttributes<InlineDataAttribute>()`). Its name is `<name>(<arguments>)`, with the arguments joined by `", "`, and its arguments are `Data`. Reflection does not promise any order of attributes, so run the cases **sorted by their names** (again ordinal).
- Run each test on a **new instance** of the class (`Activator.CreateInstance`), call the method with `method.Invoke(instance, args)`, and afterwards call `Dispose` if the instance is `IDisposable`, even when the test failed.
- A test that returns normally prints `PASS <name>`. If it throws, `Invoke` wraps the exception in a `TargetInvocationException`; the real one is in `InnerException`. For an `AssertException` print `FAIL <name>: <message>`, for any other exception `FAIL <name>: <ExceptionType>: <message>`.
- At the end print `Passed: P, failed: F, skipped: S`.

Do not change the tests or `Main`. Expected output:

```text
PASS AddOne_CountIsOne
PASS AddTwo_CountIsTwo
PASS Add_ReturnsSum(-1, 1, 0)
FAIL Add_ReturnsSum(2, 2, 5): expected 5, but was 4
PASS Add_ReturnsSum(2, 3, 5)
SKIP Discount_IsApplied: discounts are not ready
FAIL First_OfEmptyCart: InvalidOperationException: the cart is empty
FAIL Total_IsWrong: expected 4, but was 5
Passed: 4, failed: 3, skipped: 1
Instances created: 7, disposed: 7
```

Notice `AddTwo_CountIsTwo`: it passes only because it gets its own, empty cart. With one shared instance it would see the apple from the previous test and fail.

Hint: `method.GetCustomAttribute<FactAttribute>()` returns `null` when the method has no such attribute. A helper `RunOne(testClass, method, args)` that returns `null` on success and the failure text otherwise keeps `Run` short.
