A thermometer publishes its changes as an event with data. Write the two classes:

- `TemperatureEventArgs`, derived from `EventArgs`, with the read-only properties `Old` and `New` and a constructor that sets them;
- `Thermometer`, with the event `TemperatureChanged` of type `EventHandler<TemperatureEventArgs>` and the method `Set(int value)`. `Set` raises the event only when the value really changes, and the event carries the old and the new value. The raise goes through a protected method `OnTemperatureChanged`.

The starting temperature is `0`. Do not change `Main`. Expected output:

```text
0 -> 20
20 -> 25
```

The lines in order: setting `20` changes the temperature from `0`; setting `20` again changes nothing, so there is no line; and setting `25` prints `20 -> 25`.

Hint: `EventHandler<TemperatureEventArgs>` already has the right signature. Inside `Set`, save the old value, assign the new one, and call `OnTemperatureChanged(new TemperatureEventArgs(old, value))`.
