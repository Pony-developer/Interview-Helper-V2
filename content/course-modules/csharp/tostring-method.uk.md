Для карткової гри потрібні два класи: `Card` і `Hand`. Обидва готові, за винятком того, що друк показує лише назву типу (`Card`, `Hand`), бо вони не **перевизначають** `ToString()`.

Перевизначте `ToString()` в обох класах (більше нічого не змінюйте):

- `Card`: текст `Ace of Spades`, `7 of Hearts`, `Queen of Diamonds`. Ранг `1` — це `Ace`, `11` — `Jack`, `12` — `Queen`, `13` — `King`, а ранги від `2` до `10` записуються числами;
- `Hand`: текст `Hand: [` + карти, розділені комою й пробілом + `] (N cards)`. Для рівно однієї карти пишіть `(1 card)`, а не `(1 cards)`. Порожня рука — `Hand: [] (0 cards)`.

Усередині `Hand.ToString()` вживайте `ToString()` карт і не копіюйте їхній код. `Main` не змінюйте. Очікуваний вивід:

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

Рядки по порядку: карта, надрукована через `Console.WriteLine`; карта, додана до рядка через `+`; карта з явним `ToString()`; порожня рука; рука з однією картою; рука з трьома картами; карта у змінній типу `object`, яка все одно друкує свій текст, бо `ToString` віртуальний; і `string.Join` із двома картами.

Підказка: заголовок — `public override string ToString()`. У `Hand` складіть перелік текстів карт циклом (або `string.Join(", ", cards)`: `Join` викликає `ToString()` кожного елемента). Для числа візьміть `cards.Count` і виберіть слово `card` або `cards`.
