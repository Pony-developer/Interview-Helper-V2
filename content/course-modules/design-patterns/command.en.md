**In plain words:** Command turns **an action into an object**. Once an action is an object, you can store it, put it in a queue, log it, run it later, retry it, or undo it.

## A picture from life

A waiter writes your order on a slip of paper and puts it on the kitchen rail. The slip *is* the command: the cook can take it later, slips wait in a queue, and if you change your mind, the waiter can take the slip back.

## The problem

A text editor has "Bold" in the menu, on the toolbar and on Ctrl+B. And it needs Undo. If the menu, the button and the hotkey each change the text directly, the logic is copied three times, and there's nothing to undo, because the action left no trace.

## In C#

```csharp
interface ICommand
{
    void Execute();
    void Undo();
}

class RenameAccountCommand : ICommand
{
    private readonly Account account;
    private readonly string newName;
    private string oldName;

    public RenameAccountCommand(Account account, string newName) { this.account = account; this.newName = newName; }

    public void Execute() { oldName = account.Name; account.Name = newName; }
    public void Undo() { account.Name = oldName; }
}

class CommandHistory
{
    private readonly Stack<ICommand> done = new Stack<ICommand>();

    public void Run(ICommand command) { command.Execute(); done.Push(command); }
    public void UndoLast() { if (done.Count > 0) done.Pop().Undo(); }
}
```

## Where you already see it

- `ICommand` in WPF/MAUI: buttons bind to command objects.
- **Dynamics 365:** `service.Execute(new AssignRequest { ... })`. Each operation is a request object, so many of them can be packed into `ExecuteMultipleRequest` or `ExecuteTransactionRequest`.
- Background job queues (Hangfire, Azure queues): a job is a serialized command.
- CQRS and MediatR: `mediator.Send(new CreateOrderCommand(...))`.

## When to use it, and when not to

- **Fits:** undo/redo, queues and delayed execution, batching, retries, an audit log of actions, the same action from several UI places.
- **Overkill:** a simple direct method call that will never be queued or undone.

## Remember

Command = "**a request packed into an object**": who, what, with which parameters. Everything else (queue, undo, log, batch) follows from that.
