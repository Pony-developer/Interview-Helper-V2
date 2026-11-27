**In plain words:** a request travels along **a chain of handlers**. Each handler either **handles it** or **passes it to the next one**. The sender doesn't know who will finally deal with it.

## A picture from life

Calling a support line: first the voice menu tries to help, then a first-line operator, then a specialist, then a manager. Each one either solves your problem or passes you on.

## The problem

Approving an expense: amounts up to 1,000 a team lead can approve, up to 10,000 a manager, up to 50,000 a director. Before that, a receipt must be checked. A big `if / else if` chain in one method mixes all the rules, and changing the order or adding a level means editing it.

## In C#

```csharp
abstract class Approver
{
    private Approver next;

    public Approver SetNext(Approver handler) { next = handler; return handler; }

    protected string PassOn(Expense e)
    {
        return next != null ? next.Handle(e) : "Rejected: nobody can approve " + e.Amount;
    }

    public abstract string Handle(Expense e);
}

class TeamLead : Approver
{
    public override string Handle(Expense e)
    {
        if (e.Amount <= 1000) return "Approved by team lead";
        return PassOn(e);                       // not my level: pass it on
    }
}

var chain = new ReceiptCheck();
chain.SetNext(new TeamLead()).SetNext(new Manager()).SetNext(new Director());
chain.Handle(expense);
```

Each handler knows one rule. The chain is assembled in one place and can be reordered or extended.

## Two flavors

1. **Stop at the first handler that can do it**: approvals, support escalation.
2. **Every handler does its part and passes it on** (a *pipeline*): ASP.NET Core middleware, where each piece calls `await next()`; the Dynamics 365 **event pipeline**, where a message goes through PreValidation, PreOperation, the main operation and PostOperation, and any plug-in on the way can stop it by throwing an exception.

## When to use it, and when not to

- **Fits:** several independent checks or handlers whose order and number change; you want to add one without touching the others.
- **Careful:** a request can fall off the end with nobody handling it. Always decide what the end of the chain does. Long chains are also harder to debug.

## Remember

Chain of Responsibility = "**handle it or pass it on**". Middleware and the plug-in pipeline are the examples to name in an interview.
