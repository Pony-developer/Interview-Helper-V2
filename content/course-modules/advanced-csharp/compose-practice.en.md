## Task

Implement **`Pipeline.Compose<T>(params Func<T, T>[] steps)`**. It returns a new function that, when called with a value, passes it through every step **in order** and returns the result:

```
Compose(f, g, h)(x) == h(g(f(x)))
```

With no steps, the composed function returns its input unchanged.

The steps must run only when the composed function is **called**, not when it's built (the `calls` counter in `Main` checks that). Your returned lambda will capture the `steps` array: a closure.

The last part of `Main` shows the loop-capture fix from the lecture: it prints `0 1 4 ` because each lambda captures its own `copy`.

Expected output:

```
hello-big-world
50
10
calls=2
7
0 1 4 
```
