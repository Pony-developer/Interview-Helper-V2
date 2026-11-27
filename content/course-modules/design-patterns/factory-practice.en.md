Put the creation of notifiers into **one factory**.

The program already has three classes behind one interface, `INotifier`:

- `EmailNotifier`: "Email to anna: ..."
- `SmsNotifier`: cuts long texts to 20 characters;
- `TeamsNotifier`: "Teams message to @anna: ...".

Write `NotifierFactory.Create(channel)`:

- `"email"` returns an `EmailNotifier`, `"sms"` an `SmsNotifier`, `"teams"` a `TeamsNotifier`;
- the channel name is **case-insensitive**: `"SMS"` and `"sms"` are the same channel;
- any other channel throws an `ArgumentException` with the message `Unknown channel: <channel>`.

Do not change `Main`: notice that it only knows about `INotifier` and never mentions a concrete class. That's the whole point of the factory. Expected output:

```text
Email to anna: Your order #42 has been shipped
SMS to anna: Your order #42 has b...
Teams message to @anna: Your order #42 has been shipped
Error: Unknown channel: fax
```

Hint: `switch (channel.ToLowerInvariant())` with one `case` per channel and `default: throw new ArgumentException(...)`.
