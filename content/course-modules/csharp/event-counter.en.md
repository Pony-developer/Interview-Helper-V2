The class `Button` publishes its clicks through the event `Clicked`, and it can tell how many handlers are subscribed through `Subscribers`. Write the class `ClickCounter`, which:

- takes a `Button` in its constructor, saves it, and subscribes its handler `OnClicked` to `Clicked`;
- counts the clicks in the property `Count`, which starts at `0`;
- implements `Dispose()`, which unsubscribes the handler, so that the counter no longer keeps the button's subscribers alive and stops counting.

Do not change `Main` or the class `Button`. Expected output:

```text
2
2
0
1
A
```

The lines in order: after two clicks the counter has `2`; after `Dispose` a third click does not change the counter, which stays `2`; the button has no subscribers (`0`); a lambda subscribes and the button has `1` subscriber; and a click makes the lambda write `A` into the log.

Hint: `button.Clicked += OnClicked;` subscribes, `button.Clicked -= OnClicked;` unsubscribes. The method group `OnClicked` is the same in both places, so the removal works.
