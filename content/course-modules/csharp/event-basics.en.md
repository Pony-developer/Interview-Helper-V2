The class `Counter` counts how many times `Increment` was called. Add the event `Changed` to it, of type `Action`, and raise it from `Increment` after every change. The raise must not fail when nobody has subscribed.

Do not change `Main`. Expected output:

```text
changed
changed
2
quiet ok
```

The lines in order: the first increment raises the event, which prints `changed`; the second increment does the same; the value is `2`; and then a counter with no subscribers is incremented without any error, which prints `quiet ok`.

Hint: `public event Action Changed;` declares the event. Raise it with `Changed?.Invoke();`, which does nothing when there are no subscribers.
