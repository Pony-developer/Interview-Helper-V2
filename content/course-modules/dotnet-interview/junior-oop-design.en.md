"Design a parking lot / a library / a vending machine" is a common Junior–Middle task that tests classes, inheritance, interfaces and encapsulation together. The interviewer cares about your **process** more than the final diagram.

## 1. Ask about requirements

- What vehicles? (motorcycles, cars, buses) What spot sizes? Can a small vehicle use a big spot?
- How is the price calculated? Per started hour? Different rates per vehicle type?
- Several floors? Entrances? Payments, tickets, reservations? (Usually: "keep it simple".)

Write down the agreed scope: *spots of three sizes; a vehicle parks in the smallest free spot that fits; the fee is per started hour, at least one hour, with a rate per vehicle type.*

## 2. Find the nouns and the verbs

- Nouns → candidate classes: `ParkingLot`, `Spot`, `Vehicle` (`Motorcycle`, `Car`, `Bus`), `Ticket`.
- Verbs → methods: `Park(vehicle)`, `Leave(plate)`, `FreeSpots(size)`, `CalculateFee(...)`.

## 3. Decide what varies

What differs between vehicle types is **data** (size, hourly rate), so an abstract base with abstract properties works:

```csharp
public abstract class Vehicle(string plate)
{
    public string Plate { get; } = plate;
    public abstract SpotSize Size { get; }
    public abstract decimal HourlyRate { get; }
}
public sealed class Car(string plate) : Vehicle(plate)
{
    public override SpotSize Size => SpotSize.Medium;
    public override decimal HourlyRate => 20m;
}
```

Mention the alternative: if the only differences are values, one `Vehicle` class with a `VehicleType` and a rate table would be simpler — inheritance is justified when **behaviour** differs. If pricing rules will grow (night rates, subscriptions), extract `IPricingPolicy` (Strategy).

## 4. Encapsulate the rules

```csharp
public sealed class ParkingLot
{
    private readonly List<Spot> _spots;                       // nobody outside can modify the list
    public int Park(Vehicle v, DateTime at) { … }             // the "smallest fitting spot" rule lives here
    public decimal Leave(string plate, DateTime at) { … }     // the fee rule lives here
}
```

The caller can't park a bus in a small spot or forget to free a spot, because the only way to change state is through these methods.

## 5. Talk about edge cases and extensions

- The same plate parking twice; leaving with an unknown plate (throw, or return a result type).
- Time: inject `TimeProvider`/`IClock` instead of `DateTime.Now`, so the fee is testable.
- Concurrency: two entrances calling `Park` at once → a lock around spot allocation, or a database with a unique constraint.
- Persistence and API: the domain classes stay the same; a repository and a controller are added around them.

## Typical mistakes

- Starting with code before agreeing on requirements.
- Deep hierarchies (`Vehicle → MotorVehicle → FourWheeler → Car → Sedan`).
- Public setters everywhere, so any code can break invariants.
- Putting everything in one `ParkingLotManager` god class.

The practice gives you the vehicle classes; you implement the `ParkingLot` rules.
