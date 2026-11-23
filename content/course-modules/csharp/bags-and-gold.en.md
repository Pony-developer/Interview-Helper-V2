The game grows. Now the cells can **change by themselves**: the field has the method `Tick()`, one step of the game time, and it calls the virtual method `Update(field, row, col)` of every cell, from the bottom row up. The base class `Cell` does nothing in `Update`. The cells that are alive override it.

The engine is ready: `Cell`, `Wall`, `Empty`, `Gold`, `Terrain`, `Digger` and `Field` (with `Get`, `Set`, `Rows`, `Cols`, `Move`, `Tick`) are all written, and `Field` already makes a `Bag` for the symbol `S`. **You write one class, `Bag`**:

- the symbol is `S`, and the digger **cannot** enter it (the default `CanEnter`);
- in `Update`, a bag **falls** one cell down if the cell below exists and is **`Empty`**. It moves itself into that cell and leaves an `Empty` behind. Falling is counted: the bag remembers **how many ticks in a row** it has fallen;
- if the bag **cannot fall** (the cell below is a wall, earth, gold, another bag, the digger, or the field ends), the fall is over. If it fell for **two or more ticks in a row**, it **breaks**: its cell turns into `Gold`. If it fell fewer times, it stays a bag. In both cases the counter starts again from zero.

So a bag that drops from a height of one cell is safe, and a bag that drops from a greater height turns into gold. When the digger digs the earth under a bag, the bag falls: the field itself needs no change, because the bag **knows its own behaviour**. Do not change `Main`. Expected output:

```text
Start:
#######
#_S_S_#
#_____#
#D__._#
#_____#
#######
Score: 0
After 4 ticks:
#######
#_____#
#___S_#
#D__._#
#_$___#
#######
Score: 0
Digger walked right:
#######
#_____#
#___S_#
#____D#
#_$___#
#######
Score: 1
After 3 more ticks:
#######
#_____#
#_____#
#____D#
#_$_$_#
#######
Score: 1
Digger collected the gold:
#######
#_____#
#_____#
#_____#
#_D___#
#######
Score: 21
```

What happens: the left bag falls three cells and breaks into gold on the fourth tick. The right bag falls only one cell (earth is under it), so it stays a bag. Then the digger walks right and eats the earth. The bag falls two cells and breaks, and the digger collects both pieces of gold: `1 + 10 + 10` points.

Hint: the fields of a cell are private, so keep the counter in the `Bag` class: `private int fallen;`. A cell is `Empty` when `field.Get(row + 1, col) is Empty`. Check `row + 1 < field.Rows` first, so that the bottom row does not look outside the field. To fall: `field.Set(row + 1, col, this)` and `field.Set(row, col, new Empty())`.
