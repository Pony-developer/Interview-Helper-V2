`PriceFeed` lives for the whole program and publishes prices through the event `PriceChanged`. Every `PriceWindow` subscribes to the feed in its constructor and prints the prices it receives.

The program has a leak: a closed window stays subscribed. It keeps printing prices, and the feed keeps a reference to it forever, so the GC can never collect it.

Fix it in `PriceWindow.Dispose()`: unsubscribe the window from the feed. `Main` already closes every window with `using`.

Do not change `Main` or `PriceFeed`. Expected output:

```text
Window 1 shows 10
Window 1 shows 11
Window 2 shows 11
Window 1 shows 12
Subscribers left: 0
```

After a window is closed it no longer shows prices, and at the end the feed has no subscribers left.

Hint: unsubscribe with `-=` and the **same** method that was subscribed with `+=`. This is also why subscribing with a lambda that you do not save makes unsubscribing impossible.
