## Task

The OOP design exercise from the lecture, in code. The vehicle hierarchy is ready: `Vehicle` is abstract with abstract `Size` and `HourlyRate`, and `Motorcycle`, `Car` and `Bus` override them. Complete **`ParkingLot`**:

1. **`Park(vehicle, at)`** — among the free spots that are big enough (`spot.Size >= vehicle.Size`), choose the **smallest** size and then the lowest number; store the vehicle and the time and return the spot number. Return `-1` if nothing fits. (A car may take a large spot, but not when a medium one is free.)
2. **`Leave(plate, at)`** — find the spot with that plate, free it and return the fee: every **started** hour costs `HourlyRate`, at least one hour (`Math.Ceiling` of the total hours). Throw `KeyNotFoundException` for an unknown plate.
3. **`FreeSpots(size)`** — the number of free spots of exactly that size.

The lot has spots `Small, Small, Medium, Medium, Large` (numbers 1–5).

Expected output:

```
M1 -> 1
C1 -> 3
C2 -> 4
C3 -> 5
B1 -> -1
M2 -> 2
M3 -> -1
free: 0 0 0
C1 pays 60
M1 pays 10
X9 is not parked
C3 pays 20
B1 -> 5
free: 1 1 0
```
