Players are stored as tuples `Tuple<string, int>`: the name in `Item1` and the score in `Item2`. Write three methods:

- `ByScoreDescending(List<Tuple<string, int>> items)`: the players sorted by score from the highest to the lowest. Players with equal scores are sorted by name, alphabetically;
- `ByName(List<Tuple<string, int>> items)`: the players sorted by name (the order of the names only);
- `Best(List<Tuple<string, int>> items)`: the player with the highest score, using the same tie rule as `ByScoreDescending` (for equal scores, the alphabetically first name wins).

Do not change `Main`. Expected output:

```text
Bob 90
Dan 85
Ann 70
Cy 70
Bob 90
Ann Bob Cy Dan
```

The lines in order: the sorted players with their scores; the best player; and the names in alphabetical order.

Hint: `OrderByDescending(t => t.Item2).ThenBy(t => t.Item1)` sorts by score and then by name. `OrderBy(t => t.Item1)` sorts by name. `Best` can be `ByScoreDescending(items).First()`.
