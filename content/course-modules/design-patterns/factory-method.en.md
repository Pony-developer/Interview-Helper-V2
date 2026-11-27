**In plain words:** a factory is **one place that decides which object to create**. The rest of the code says *what it needs* ("a notifier for SMS") and gets back an object behind an interface, without knowing the concrete class.

## A picture from life

At a pizzeria you order "a Margherita". You don't walk into the kitchen and pick the flour, the oven and the cook. The kitchen (the factory) knows how to make it and hands you the result.

## The problem

```csharp
// Scattered all over the code:
INotifier notifier;
if (channel == "email") notifier = new EmailNotifier();
else if (channel == "sms") notifier = new SmsNotifier();
else ...
```

Every place that creates notifiers repeats this `if`. Add Teams, and you must find and edit all of them.

## Simple factory

Put the decision in one place:

```csharp
static class NotifierFactory
{
    public static INotifier Create(string channel)
    {
        switch (channel)
        {
            case "email": return new EmailNotifier();
            case "sms": return new SmsNotifier();
            default: throw new ArgumentException("Unknown channel: " + channel);
        }
    }
}

INotifier notifier = NotifierFactory.Create(user.PreferredChannel);
```

Strictly speaking, this "simple factory" isn't one of the 23 GoF patterns, but it is the one you'll write most often.

## Factory Method (the GoF version)

Here a **base class** defines the algorithm and leaves **one method for creating an object** to its subclasses:

```csharp
abstract class ReportExporter
{
    public void Export(Report report)
    {
        var writer = CreateWriter();        // the factory method: subclasses decide WHAT to create
        writer.Write(report);
    }

    protected abstract IReportWriter CreateWriter();
}

class PdfExporter : ReportExporter
{
    protected override IReportWriter CreateWriter() { return new PdfWriter(); }
}

class ExcelExporter : ReportExporter
{
    protected override IReportWriter CreateWriter() { return new ExcelWriter(); }
}
```

## When to use it, and when not to

- **Fits:** the concrete class depends on data (config, user choice, record type), or creation is complicated and you don't want it repeated.
- **Overkill:** a factory that always creates the same one class. Just call `new`.

## Remember

A factory answers the question "**who decides which class to create?**" Answer: one place, not everyone. New types are added in that one place (the open/closed principle).
