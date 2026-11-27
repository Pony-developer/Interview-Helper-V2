**In plain words:** a facade is **one simple front door to a complicated system**. Behind it there may be ten classes; the caller sees one method.

## A picture from life

A hotel reception. To get a room, a taxi and a dinner table you don't phone housekeeping, the parking service and the restaurant yourself. You talk to the receptionist, who coordinates everything behind the scenes.

## The problem

Placing an order touches many parts: check stock, reserve items, charge the card, create a delivery, send an email. If every controller, plug-in and background job calls all five services in the right order, the order logic is copied everywhere, and every copy has to be fixed when the process changes.

## In C#

```csharp
class OrderFacade
{
    private readonly Inventory inventory;
    private readonly PaymentGateway payments;
    private readonly DeliveryService delivery;
    private readonly EmailSender email;

    public OrderFacade(Inventory inventory, PaymentGateway payments, DeliveryService delivery, EmailSender email)
    {
        this.inventory = inventory; this.payments = payments; this.delivery = delivery; this.email = email;
    }

    // One simple method hides the whole process
    public void PlaceOrder(Cart cart, Customer customer)
    {
        inventory.Reserve(cart.Items);
        payments.Charge(customer.Card, cart.Total);
        var trackingNumber = delivery.Schedule(cart.Items, customer.Address);
        email.Send(customer.Email, "Your order is on its way: " + trackingNumber);
    }
}
```

## Where you already see it

- `File.ReadAllText(path)` hides opening a stream, choosing an encoding, reading and closing.
- `HttpClient.GetStringAsync(url)` hides sockets, headers and response parsing.
- A "service layer" in a backend: `CustomerService.Register(...)` calls repositories, validation and email for you.

## When to use it, and when not to

- **Fits:** clients need a simple way to do a common thing with a complex subsystem.
- **Careful:** a facade that keeps growing until it does everything becomes a **God object**. It is a front door, not the whole building. The subsystem classes should still be usable directly when someone needs fine control.

## Remember

Facade **simplifies**: it doesn't add new behavior, it just gives a short, safe path through something complicated.
