A card game needs two classes: `Card` and `Hand`. Both are ready, except that printing them shows only the name of the type (`Card`, `Hand`), because they do not **override** `ToString()`.

Override `ToString()` in both classes (do not change anything else):

- `Card`: the text `Ace of Spades`, `7 of Hearts`, `Queen of Diamonds`. The rank `1` is `Ace`, `11` is `Jack`, `12` is `Queen`, `13` is `King`, and the ranks `2` to `10` are written as numbers;
- `Hand`: the text `Hand: [` + the cards, separated by a comma and a space + `] (N cards)`. For exactly one card, write `(1 card)`, not `(1 cards)`. An empty hand is `Hand: [] (0 cards)`.

Inside `Hand.ToString()`, use the `ToString()` of the cards, and do not copy their code. Do not change `Main`. Expected output:

```text
Ace of Spades
You drew: Queen of Diamonds
7 of Hearts
Hand: [] (0 cards)
Hand: [Ace of Spades] (1 card)
Hand: [Ace of Spades, 7 of Hearts, Queen of Diamonds] (3 cards)
King of Clubs
Ace of Spades | 7 of Hearts
```

The lines in order: a card printed with `Console.WriteLine`; a card added to a string with `+`; a card with an explicit `ToString()`; an empty hand; a hand with one card; a hand with three cards; a card stored in a variable of the type `object`, which still prints its own text, because `ToString` is virtual; and `string.Join` with two cards.

Hint: the header is `public override string ToString()`. In `Hand`, build the list of the card texts with a loop (or `string.Join(", ", cards)`: `Join` calls `ToString()` of every element). Use `cards.Count` for the number and choose the word `card` or `cards`.
