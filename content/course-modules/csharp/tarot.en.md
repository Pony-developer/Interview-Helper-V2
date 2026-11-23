A tarot deck has 22 "Major Arcana" cards. The method `GetDeck()` returns them as a `string[]`, in order, with the indexes 0 to 21: `The Fool` is 0, `The Magician` is 1, and so on up to `The World`, which is 21. The method is already written.

A fortune-teller draws three cards for a number `n`:

1. the card at index `n % 22`;
2. the card at index `(n * 7) % 22`;
3. the card at index `(n * n) % 22`.

The remainder by 22 keeps the index inside the deck, whatever the number is.

Implement `Spread(n)`. It returns an array of three card names, in that order. Do not change `GetDeck` or `Main`. For `n = 5`, the indexes are 5, 13 and 3. Expected output:

```text
5: The Hierophant | Death | The Empress
10: Wheel of Fortune | The Emperor | The Hanged Man
21: The World | The Devil | The Magician
```

Hint: take the deck from `GetDeck()` into a local variable, and use `deck.Length` instead of the number 22, so that the method keeps working if the deck changes.
