**In plain words:** Bridge splits one class that changes in **two independent directions** into **two separate hierarchies** connected by a reference. Then each side can grow on its own.

## A picture from life

A TV remote and a TV. There are many kinds of remotes (simple, with voice control) and many brands of TVs. Any remote can work with any TV because they agree on a small set of signals. You don't need a "voice remote for Samsung" and a "voice remote for LG" as separate products.

## The problem

Notifications come in kinds: **alert**, **reminder**, **report**. They can go through channels: **email**, **SMS**, **Teams**. With inheritance you get `EmailAlert`, `SmsAlert`, `TeamsAlert`, `EmailReminder`... 3 × 3 = 9 classes, and adding a channel means three more classes.

## In C#

```csharp
// Side 1: HOW to deliver (the "implementation")
interface IChannel
{
    void Deliver(string to, string text);
}

class EmailChannel : IChannel { public void Deliver(string to, string text) { /* SMTP */ } }
class SmsChannel : IChannel { public void Deliver(string to, string text) { /* SMS gateway */ } }

// Side 2: WHAT to send (the "abstraction"). It HOLDS a channel: that reference is the bridge
abstract class Notification
{
    protected readonly IChannel channel;
    protected Notification(IChannel channel) { this.channel = channel; }
    public abstract void Send(string to);
}

class Alert : Notification
{
    public Alert(IChannel channel) : base(channel) { }
    public override void Send(string to) { channel.Deliver(to, "ALERT: server is down"); }
}

class Reminder : Notification
{
    public Reminder(IChannel channel) : base(channel) { }
    public override void Send(string to) { channel.Deliver(to, "Reminder: meeting at 10:00"); }
}

new Alert(new SmsChannel()).Send("+380...");
new Reminder(new EmailChannel()).Send("anna@example.com");
```

Now it's 3 + 3 classes, and they combine freely.

## Where you already see it

- Database drivers: your code talks to ADO.NET (`DbConnection`, `DbCommand`), and a driver for SQL Server or PostgreSQL does the real work.
- Logging: `ILogger` on one side, "sinks" (console, file, Application Insights) on the other.

## Bridge vs Strategy vs Adapter

The code looks like Strategy (an object holds an interface), and that's fine. The intent differs: **Bridge** is planned up front to let two hierarchies grow independently; **Strategy** swaps one algorithm; **Adapter** is added afterwards to make existing things fit.

## Remember

When you see classes named "*Thing*×*Way*" multiplying (`EmailAlert`, `SmsAlert`...), split the two dimensions and connect them with a reference.
