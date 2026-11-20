---
skill: regex
title: "Regular expressions in JavaScript"
summary: "Pattern syntax (classes, quantifiers, anchors, groups), flags including g, y, u and s, greedy vs lazy matching, named groups and backreferences, lookarounds, the test/exec/match/matchAll/replace/split methods, the lastIndex trap, escaping user input, Unicode, and catastrophic backtracking."
readingMinutes: 9
---

A regular expression describes a **pattern of text**. In JavaScript it's a `RegExp` object, written as a literal (`/\d+/g`) or built from a string (`new RegExp("\\d+", "g")`). Regexes are perfect for validation, search and light parsing. For nested structures like HTML or JSON, use a real parser instead.

## Building blocks

| Syntax | Meaning |
| --- | --- |
| `.` | any character except line breaks (any at all with the `s` flag) |
| `\d` `\w` `\s` | digit, word character `[A-Za-z0-9_]`, whitespace (`\D` `\W` `\S` negate) |
| `[abc]` `[^abc]` `[a-z]` | character class, negated class, range |
| `^` `$` | start and end of input (of each line with the `m` flag) |
| `\b` | word boundary |
| `*` `+` `?` `{2,5}` | 0+, 1+, 0–1, between 2 and 5 repetitions |
| `(…)` `(?<year>…)` `(?:…)` | capturing group, named group, non-capturing group |
| `a\|b` | alternation |
| `\1` `\k<year>` | backreference to a group |
| `(?=…)` `(?!…)` `(?<=…)` `(?<!…)` | lookahead, negative lookahead, lookbehind, negative lookbehind |

Escape special characters with a backslash: `\.` `\(` `\?`. Inside a string passed to `new RegExp`, the backslash itself must be escaped (`"\\."`).

## Flags

`g` (global: find all matches), `i` (case-insensitive), `m` (multiline anchors), `s` (dotAll), `u` (Unicode: code points, `\p{…}` property escapes), `v` (an upgraded `u` with set operations), `y` (sticky: match exactly at `lastIndex`), `d` (match indices).

## Greedy vs lazy

Quantifiers are **greedy**: they take as much as possible, then backtrack. Adding `?` makes them **lazy**: as little as possible.

```js
"<b>a</b><b>c</b>".match(/<b>.*<\/b>/)[0];  // "<b>a</b><b>c</b>"
"<b>a</b><b>c</b>".match(/<b>.*?<\/b>/)[0]; // "<b>a</b>"
```

A negated class is often clearer and faster than laziness: `/<b>[^<]*<\/b>/`.

## Methods

```js
/^\d{4}$/.test("2025");                      // true
"2025-03-15".match(/(\d+)-(\d+)-(\d+)/);    // ["2025-03-15", "2025", "03", "15"], index, groups
"a1b22c333".match(/\d+/g);                   // ["1", "22", "333"] (no groups with g)
[..."a1b22".matchAll(/(?<n>\d+)/g)].map((m) => m.groups.n); // ["1", "22"]
"2025-03-15".replace(/(?<y>\d+)-(?<m>\d+)-(?<d>\d+)/, "$<d>.$<m>.$<y>"); // "15.03.2025"
"Hello World".replace(/o/g, (match, offset) => match.toUpperCase());     // "HellO WOrld"
"a, b,c".split(/\s*,\s*/);                    // ["a", "b", "c"]
```

`replaceAll` requires the `g` flag when given a regex. `str.search(re)` returns the index of the first match or `-1`.

## The `lastIndex` trap

A regex with `g` or `y` is **stateful**: `test` and `exec` start searching at `re.lastIndex` and update it after a match. Reusing such a regex across inputs gives alternating results:

```js
const re = /a/g;
re.test("a"); // true  (lastIndex is now 1)
re.test("a"); // false (search started at 1; lastIndex reset to 0)
```

Don't use `g` with `test`, or create the regex inside the function. `match`, `matchAll`, `replace` and `split` handle `lastIndex` for you.

## Building regexes from user input

`new RegExp(userInput)` treats `.`, `*`, `+`, `(` and so on as syntax: `"c++"` throws "Nothing to repeat", and `"a.b"` also matches `"axb"`. Escape input first:

```js
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
new RegExp(escapeRegExp(query), "gi");
```

## Unicode

Without `u`, a regex works on UTF-16 code units: `/^.$/.test("😀")` is `false` because the emoji is two units. With `u`, `.` matches a full code point, and property escapes like `\p{L}` (any letter, including Cyrillic) and `\p{Emoji}` become available: `/^\p{L}+$/u.test("Київ")` is `true`.

## Performance: catastrophic backtracking

Nested quantifiers over the same characters, like `/^(a+)+$/`, can take exponential time on inputs that almost match (`"aaaa…a!"`), freezing the main thread. With user-controlled input this becomes a denial-of-service vulnerability (**ReDoS**). Avoid nested and overlapping quantifiers, anchor patterns, prefer specific classes over `.*`, and limit input length.

## Interview checklist

- Read and write common patterns (digits, words, anchors, groups, alternation).
- Explain greedy vs lazy quantifiers.
- Use named groups and replacement patterns or functions.
- Explain the `lastIndex` trap with `g` and `test`.
- Escape user input in dynamic regexes, and know when the `u` flag matters.
- Recognise patterns at risk of catastrophic backtracking.
