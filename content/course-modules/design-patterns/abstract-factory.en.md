**In plain words:** an abstract factory creates a **whole family of objects that belong together**. You pick the family once, and every object you get from it matches the others.

## A picture from life

Furniture stores sell sets: a "Modern" set has a modern chair, table and sofa; a "Classic" set has classic ones. You choose the style once, and you never end up with a baroque chair next to a glass table.

## The problem

An app supports a light and a dark theme. Each theme has its own button, checkbox and dialog. If code creates them one by one with `if (dark)`, sooner or later someone creates a light button in a dark dialog.

## In C#

```csharp
interface IUiFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

class LightUiFactory : IUiFactory
{
    public IButton CreateButton() { return new LightButton(); }
    public ICheckbox CreateCheckbox() { return new LightCheckbox(); }
}

class DarkUiFactory : IUiFactory
{
    public IButton CreateButton() { return new DarkButton(); }
    public ICheckbox CreateCheckbox() { return new DarkCheckbox(); }
}

// The screen gets the factory once and never thinks about themes again
class SettingsScreen
{
    public SettingsScreen(IUiFactory ui)
    {
        var save = ui.CreateButton();
        var notifications = ui.CreateCheckbox();
    }
}
```

## A real backend example

An integration works with "the test environment" or "production". Each needs its own HTTP client, its own storage and its own message queue. An `IEnvironmentFactory` with `TestEnvironmentFactory` and `ProductionEnvironmentFactory` makes it impossible to mix a test queue with production storage.

## Factory vs Abstract Factory

| | Factory / Factory Method | Abstract Factory |
| --- | --- | --- |
| Creates | **one** kind of product | a **family** of related products |
| Typical shape | one `Create(...)` method | an interface with several `CreateX()` methods |

## When to use it, and when not to

- **Fits:** several related objects must always come from the same "set".
- **Overkill:** only one product, or the family never changes.

## Remember

Abstract Factory = "a factory of matching sets". Swap one factory object, and the whole family changes at once.
