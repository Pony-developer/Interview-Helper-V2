In a game like Angry Birds, a bird is launched with a speed and an angle. Your task is to compute how the flight goes, with clean code: constants instead of magic numbers, short methods with clear names, and calculation separate from printing.

Without air resistance, a projectile launched at speed `v` (m/s) and angle `θ` flies:

- **range**: `v² · sin(2θ) / g`
- **flight time**: `2 · v · sin(θ) / g`
- **maximum height**: `(v · sin(θ))² / (2 · g)`

where `g` is the gravitational acceleration, `9.8`.

`Math.Sin` takes the angle in **radians**, so first convert: `radians = degrees · π / 180`.

Implement the four methods whose bodies are stubs: `ToRadians`, `Range`, `FlightTime` and `MaxHeight`. The constant `Gravity` is already declared. Do not change `Main`.

For speed 20 and angle 45° the output is:

```text
Range: 40.82
Time: 2.89
Height: 10.2
```

Hint: the other methods can call `ToRadians`, so you only write the conversion once.
