## Task

Question 129: "How would you implement cross-cutting concerns such as logging, validation or transactions?" A popular answer in .NET is a **mediator pipeline** (MediatR's `IPipelineBehavior`): every request goes through a chain of behaviors before reaching its handler. Build the core of it.

Complete:

1. **`ValidationBehavior.Handle(request, next)`** — if `Amount <= 0`, throw `ArgumentException("Amount must be positive")` **without calling `next`**: the handler never runs. Otherwise return `next()`.
2. **`Mediator.Send<TRequest, TResponse>(request)`**:
   - find the handler registered for `typeof(TRequest)` and cast it to `IHandler<TRequest, TResponse>`;
   - start with `Func<TResponse> next = () => handler.Handle(request);`
   - wrap it in every registered behavior of type `IBehavior<TRequest, TResponse>` (`behaviors.OfType<…>()` skips behaviors for other request types) so that the **first registered behavior is the outermost** — wrap in reverse order. Capture the current `next` and behavior in local variables inside the loop;
   - call the resulting delegate.

Watch the output for the invalid order: logging starts (`-> CreateOrder`), validation stops the pipeline, so neither the handler nor the `<-` line runs.

Expected output:

```
-> CreateOrder
handle CreateOrder for ann
<- CreateOrder = 1
-> CreateOrder
rejected: Amount must be positive
-> CreateOrder
handle CreateOrder for bob
<- CreateOrder = 2
-> GetOrderCount
<- GetOrderCount = 2
```
