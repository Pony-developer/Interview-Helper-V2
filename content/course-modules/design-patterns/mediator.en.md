**In plain words:** a mediator is **a central coordinator**. Instead of objects talking to each other directly (everyone knows everyone), they talk only to the mediator, and it decides who should react.

## A picture from life

An airport control tower. Planes don't negotiate with each other about who lands first; each one talks only to the tower, and the tower coordinates everybody.

## The problem

A registration form: when "Company" is ticked, the "Company name" field appears and becomes required; when the country is "Ukraine", the phone mask changes; "Submit" is enabled only when everything is valid. If each control references the others, you get a web of links where changing one field breaks three others.

## In C#

```csharp
interface IFormMediator
{
    void Changed(string field);
}

class RegistrationForm : IFormMediator
{
    public Checkbox IsCompany = new Checkbox();
    public TextBox CompanyName = new TextBox();
    public Button Submit = new Button();

    // All the "if this changes, update that" rules live in ONE place
    public void Changed(string field)
    {
        if (field == "IsCompany")
        {
            CompanyName.Visible = IsCompany.Checked;
            CompanyName.Required = IsCompany.Checked;
        }
        Submit.Enabled = !CompanyName.Required || CompanyName.Text.Length > 0;
    }
}
```

The checkbox only says "I changed" to the mediator; it doesn't know that a text box or a button exists.

## Where you already see it

- **MediatR** in .NET: controllers send `mediator.Send(new CreateOrderCommand(...))` and don't know which handler will process it.
- A chat room: users send messages to the room, the room delivers them.
- **Dynamics form scripts:** a form's `OnLoad` / `OnChange` script that coordinates fields is a mediator for the form's controls.

## When to use it, and when not to

- **Fits:** many objects interact in tangled ways, and you want each to be reusable on its own.
- **Careful:** the mediator itself can grow into a **God object** that knows everything. Split it by area when it gets big.

## Remember

Mediator = "**talk to the tower, not to each other**". It turns many-to-many links into one-to-many.
