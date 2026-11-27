**In plain words:** instead of building a new object from scratch, you **copy an existing one** (the prototype) and change what's different.

## A picture from life

You need a contract for a new client. Nobody writes it from a blank page: you take the last signed contract, make a copy, and change the name, the dates and the price.

## The problem

Creating an object can be expensive (it loads data, runs calculations) or tedious (dozens of settings). If you need many similar objects, it's cheaper to set up one carefully and clone it.

## In C#

```csharp
class EmailTemplate
{
    public string Subject;
    public string Body;
    public List<string> Attachments = new List<string>();

    // Shallow copy: fields are copied, but Attachments is the SAME list in both objects
    public EmailTemplate ShallowCopy() { return (EmailTemplate)MemberwiseClone(); }

    // Deep copy: nested objects are copied too
    public EmailTemplate DeepCopy()
    {
        var copy = (EmailTemplate)MemberwiseClone();
        copy.Attachments = new List<string>(Attachments);
        return copy;
    }
}

var welcome = new EmailTemplate { Subject = "Welcome!", Body = "..." };
welcome.Attachments.Add("guide.pdf");

var vipWelcome = welcome.DeepCopy();
vipWelcome.Subject = "Welcome, VIP!";
vipWelcome.Attachments.Add("vip-offer.pdf");   // the original still has only guide.pdf
```

## The trap: shallow vs deep copy

`MemberwiseClone()` copies the fields one by one. For a `string` or an `int` that's fine. For a `List` or another object, only the **reference** is copied, so the clone and the original share it. Change the list in one, and it changes in the other. That's the most common Prototype bug and a favorite interview question.

## Where you already see it

- `ICloneable` in .NET (rarely recommended, because it doesn't say whether the copy is deep or shallow).
- `record` types in modern C#: `var copy = original with { Subject = "New" };` creates a copy with one change.
- In Dynamics: copying an existing record as a template for a new one.

## Remember

Prototype = "copy and adjust". Always ask: *does the copy need its own nested objects?* If yes, make a deep copy.
