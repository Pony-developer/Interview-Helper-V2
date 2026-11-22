Fix every type conversion error. Read the variable names: they tell you what each value is supposed to be.

- `fahrenheit` must keep its fractional part.
- `roundedFahrenheit` is `fahrenheit` rounded to the nearest whole number. Use `Math.Round`, not a plain cast.
- `secondsInCentury` must hold the exact result, which is larger than an `int` can store.

The program should print:

```text
97.9
98
3153600000
```
