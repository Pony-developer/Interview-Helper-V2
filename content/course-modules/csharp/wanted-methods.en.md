`Main` already calls four methods that do not work yet. Their bodies are stubs that return a placeholder. Implement them:

- `Square(x)` returns `x` multiplied by itself.
- `IsEven(n)` returns `true` for even numbers and `false` for odd ones.
- `Max3(a, b, c)` returns the largest of three numbers. It must also work for negative numbers.
- `Greeting(name)` returns the text `Hello, <name>!`.

Do not change `Main`. Expected output:

```text
49
True
False
19
-2
Hello, Ann!
```

Hint: a comparison such as `n % 2 == 0` is already a `bool`, so it can be returned directly. For the maximum, `Math.Max` takes two numbers at a time.
