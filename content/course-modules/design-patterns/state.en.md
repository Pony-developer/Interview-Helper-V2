**In plain words:** State lets an object **change its behavior when its internal state changes**, as if it became a different object. Each state is its own class, and the states decide for themselves which state comes next.

## A picture from life

A traffic light. Pressing the pedestrian button does different things depending on whether it's green, yellow or red. And the light itself knows that after green comes yellow, not red.

## The problem

```csharp
void Ship()
{
    if (status == "New") Console.WriteLine("Pay first");
    else if (status == "Paid") { status = "Shipped"; ... }
    else if (status == "Shipped") Console.WriteLine("Already shipped");
    else if (status == "Cancelled") Console.WriteLine("Order is cancelled");
}
// ...and the same ladder of ifs in Pay(), Cancel(), Refund()...
```

Every method repeats the same `if` on the status. Adding a "Returned" status means finding and editing every ladder.

## In C#

```csharp
abstract class OrderState
{
    public abstract string Name { get; }

    // By default an action isn't allowed: each state overrides only what it permits
    public virtual OrderState Pay() { Console.WriteLine("Cannot pay: order is " + Name); return this; }
    public virtual OrderState Ship() { Console.WriteLine("Cannot ship: order is " + Name); return this; }
}

class NewState : OrderState
{
    public override string Name { get { return "New"; } }
    public override OrderState Pay() { return new PaidState(); }     // New -> Paid
}

class PaidState : OrderState
{
    public override string Name { get { return "Paid"; } }
    public override OrderState Ship() { return new ShippedState(); } // Paid -> Shipped
}

class Order
{
    public OrderState State = new NewState();
    public void Pay() { State = State.Pay(); }
    public void Ship() { State = State.Ship(); }
}
```

All the rules for "Paid" live in `PaidState`. A new status is a new class.

## State vs Strategy

The class diagrams are almost identical: an object holds an interface and delegates to it. The difference: with **Strategy** the *client* picks the algorithm and it rarely changes; with **State** the *states switch themselves* as things happen (`Pay()` returns the next state).

## Where you already see it

- Order and document lifecycles, connection states (connecting, open, closed), game characters.
- **Dynamics 365:** `statecode` / `statuscode` on records, and business process flows with their stages. Plug-ins often enforce "from which status to which status" transitions, which is exactly a state machine.

## When to use it, and when not to

- **Fits:** an object has several states, behavior differs a lot between them, and the rules of transitions matter.
- **Overkill:** two states and one `if`. A `bool` is fine. For simple lifecycles, a transition table (a dictionary of "from, action -> to") can also be enough.

## Remember

State = "**each state is a class that knows what it allows and what comes next**". It replaces ladders of `if (status == ...)`.
