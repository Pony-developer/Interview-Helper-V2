Two phrases are **anagrams** when one can be made from the letters of the other: `Listen` and `Silent`, or `Dormitory` and `Dirty room`.

Implement `AreAnagrams(a, b)`. It returns `true` if the two texts consist of the same letters in the same quantities. The comparison **ignores the case and the spaces**.

The classic way uses what you learned about strings and arrays: turn each text into an array of characters, sort the arrays, and compare the results.

1. Remove the spaces and make the text lower case.
2. `ToCharArray()` and `Array.Sort`.
3. Build strings with `new string(array)` and compare them with `==`. (Comparing the arrays themselves with `==` would compare their references, and always give `false`.)

Do not change `Main`. Expected output:

```text
True
True
False
True
True
False
False
```

The checks in `Main` include texts of different case, texts with spaces, two empty texts (they are anagrams of each other), and pairs with the same letters in different quantities, such as `aab` and `abb`.
