`Main` already uses an enum named `Weekday`, but the enum does not exist yet, so the program does not compile.

Declare `Weekday` inside the `Program` class (above `Main`) with seven members, from `Monday` to `Sunday`. The numbering must start at **1** for `Monday`, so that `Sunday` is 7.

Do not change `Main`. Expected output:

```text
Friday
5
Sunday
6
```

Hint: give only the first member an explicit number, and the others will follow on their own.
