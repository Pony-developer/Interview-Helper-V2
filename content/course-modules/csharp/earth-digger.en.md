A small game: the **digger** walks on a field and digs his way through the **earth**. The field is a grid of **cells**, and all the cells are objects of classes derived from one base class `Cell`:

- `Wall` (`#`): the digger cannot enter it. Ready;
- `Empty` (`_`): free space, and the digger can enter it. Ready;
- `Gold` (`$`): the digger can enter it, and gets **10 points**. Ready;
- **`Terrain`** (`.`): the earth. The digger can enter it (and digs it), and gets **1 point**. **Write it**;
- **`Digger`** (`D`): the digger himself. Nobody can walk into the digger, so he must not be enterable. **Write it**.

The base class declares what each cell tells about itself: the symbol (`Symbol`, abstract), whether a digger can enter (`CanEnter`, virtual, `false` by default) and the points for entering (`Score`, virtual, `0` by default). Override only what is different.

The third part is the method **`Field.Move(dRow, dCol)`**. It moves the digger by one cell: `dRow` is the shift down (negative: up), and `dCol` is the shift to the right (negative: left). The rules:

- if the target cell is **outside the field**, or it **cannot be entered**, nothing changes, and the method returns `false`;
- otherwise the digger moves there. The score grows by the `Score` of the target cell, the cell that the digger leaves becomes `Empty`, and the method returns `true`.

Notice that `Move` does **not** check what kind of cell it is: it asks the cell (`CanEnter`, `Score`). This is why a new kind of cell needs no change in `Move`. Do not change `Main`. Expected output:

```text
TTFTTTTF
#####
#D__#
#___#
#####
Score: 14
True True False
__D
Score: 11
```

The lines in order: the results of the eight moves `RRRDLLUU` (`T` is a successful move, `F` is a refusal; the digger bumps into the wall twice); the final field; the score; and a second, one-row field `D.$` where the digger walks right three times and the last step leaves the field, with the field and the score after that.

Hint: in the first game the digger enters four pieces of earth (`4 × 1`) and the gold (`10`), which is `14`; the free cell that he enters at the end gives nothing. `Terrain` and `Digger` are short: each overrides `Symbol`, and `Terrain` also overrides `CanEnter` and `Score`. In `Move`, after the checks, copy the digger object into the new cell **before** you put `Empty` into the old one, and remember the new position of the digger in the fields `diggerRow` and `diggerCol`.
