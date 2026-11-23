The last part of the game: **monsters**. The engine and the `Bag` from the previous task are ready, and `Field` already makes a `Monster` for the symbol `M`. The field has two more members that you need: `Alive` (is the digger alive) and `Kill()`. In `Move`, the field already checks `Kills` of the cell that the digger enters.

**Write the class `Monster`** (a cell `M`):

- `CanEnter` is `true` (the digger **can** step on it) and `Kills` is `true` (and then he dies). The monster adds no score;
- it **patrols** horizontally. It starts by moving to the **right**. In `Update`, look at the cell next to it in the current direction:
  - if it is the **digger**, the monster kills him: call `field.Kill()`, and stay in place;
  - if it is **`Empty`**, the monster moves there (and leaves an `Empty`);
  - for anything else (a wall, earth, gold, a bag), or if the field ends, the monster **turns around** and does not move in this tick.

Do not change `Main`. Expected output:

```text
#########
#M__.__D#
#########
#########
#__M.__D#
#########
#########
#__MD___#
#########
Score: 1
Alive: False after 6 ticks
True
Alive: False
False
#_MD# True
#_MD# False
```

The lines in order: the start field; after three ticks the monster has reached the earth and turned around; the digger goes three cells left and eats the earth, and stops next to the monster, with a score of 1; the program makes ticks until the digger dies, and he dies after 6 ticks (the monster goes left to the wall, turns, and comes back); in a small field the digger steps on a monster (the move happens, and he dies), and a dead digger cannot move (`False`); in the last field, the monster is two cells from the digger: after the first tick it stands next to him, and after the second one, it kills him.

Hint: keep the direction in a private field `private int direction = 1;` and invert it with `direction = -direction`. Use `target is Digger` and `target is Empty` for the checks. The game stops by itself after the kill: `Field.Tick` returns as soon as `Alive` becomes `false`.
