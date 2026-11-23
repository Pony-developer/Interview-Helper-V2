**Exponential smoothing** turns a noisy stream of values into a smooth curve. The first smoothed value is the first input. Each next smoothed value mixes the new input with the previous smoothed value:

`s = alpha * value + (1 - alpha) * s`

Here `alpha` is between `0` and `1`: a bigger `alpha` reacts faster to new values.

Write two methods:

- `Smooth(IEnumerable<double> values, double alpha)`: an iterator that yields the smoothed value for each input. It must be **lazy**, so it works with an infinite input;
- `FirstN(IEnumerable<double> items, int n)`: returns a `List<double>` with the first `n` items of a sequence. It must **stop reading** after `n` items, so that it works with an infinite sequence. (`n` is positive.)

The methods `Constant`, `Ramp` and `Print` are ready. `Constant(value)` gives the value forever, and `Ramp()` gives `0, 1, 2, ...` forever. Do not change `Main`. Expected output:

```text
10 15 22.5
8 8 8
0 0.5 1.25 2.125
```

The lines in order: smoothing `10, 20, 30` with `alpha = 0.5` (`10`, then `0.5·20 + 0.5·10 = 15`, then `0.5·30 + 0.5·15 = 22.5`); the first three smoothed values of an infinite constant `8`; and the first four smoothed values of the infinite ramp.

Hint: in `Smooth`, keep the previous smoothed value in a variable and a flag that the first item has not been seen. In `FirstN`, use `foreach`, add the item to the list, and `break` when the list has `n` items. Pay attention to the order: check the count **after** adding, so that the loop does not read one extra item.
