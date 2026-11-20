---
skill: unicode-strings
title: "Strings and Unicode: what length really counts"
summary: "How JavaScript strings are stored (UTF-16 code units), code points and surrogate pairs, grapheme clusters and Intl.Segmenter, normalisation and why equal-looking strings differ, case mapping surprises, the u and v regex flags, locale-aware sorting with Intl.Collator, and converting text to bytes."
readingMinutes: 10
---

Strings look simple until a user types an emoji, a name with an accent, or text in Turkish. Most string bugs come from mixing up three different units: **code units**, **code points** and **graphemes** (what a person calls a character).

## Three units of "character"

| Unit | What it is | How JS exposes it |
| --- | --- | --- |
| Code unit | 16-bit value; JS strings are sequences of these (UTF-16) | `length`, `[i]`, `charCodeAt`, `slice`, `split("")` |
| Code point | a Unicode number, `U+0000` to `U+10FFFF` | `for…of`, `[...str]`, `Array.from`, `codePointAt`, `String.fromCodePoint` |
| Grapheme cluster | a user-perceived character, possibly several code points | `Intl.Segmenter` with `granularity: "grapheme"` |

Code points above `U+FFFF` (most emoji, many historic scripts, some CJK characters) need **two** code units, a **surrogate pair**. So `"😀".length` is `2`, and `"😀".slice(0, 1)` gives half of the pair, an invalid **lone surrogate**. `str.isWellFormed()` detects that, and `toWellFormed()` replaces lone surrogates with `U+FFFD`.

Graphemes can be even longer: `"👨‍👩‍👧"` is three emoji joined by zero-width joiners (length 8), a flag is two regional-indicator symbols, and `"é"` may be `e` plus a combining accent. Only a segmenter counts them as one:

```js
const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
[...seg.segment("👨‍👩‍👧é")].length; // 2
```

Use graphemes for anything user-facing: character counters, truncation, cursor movement, reversing. `Intl.Segmenter` also splits into words and sentences in languages without spaces.

## Normalisation

The same visible text can be encoded differently. `"é"` can be the single code point `U+00E9` (**composed**, NFC) or `e` + `U+0301` (**decomposed**, NFD). They look identical but aren't `===`, have different lengths and sort differently. Normalise before comparing, hashing or storing user input: `a.normalize("NFC") === b.normalize("NFC")`. macOS file names and some keyboards produce NFD, so this shows up in real systems. NFKC additionally folds compatibility characters (`ﬁ` → `fi`, full-width digits), which helps usernames and search.

## Case mapping and comparison

- Case mapping can change length: `"ß".toUpperCase()` is `"SS"`. It's also language-dependent: Turkish has dotted and dotless i, so use `toLocaleUpperCase("tr")` there.
- Case-insensitive comparison: prefer `a.localeCompare(b, undefined, { sensitivity: "base" }) === 0` or an `Intl.Collator`, rather than `toLowerCase()` on both sides.
- `array.sort()` compares UTF-16 code units: uppercase before lowercase, `"é"` after `"z"`, `"item10"` before `"item2"`. Use `new Intl.Collator(locale, { numeric: true }).compare` for human ordering, and reuse the collator because creating one is expensive.

## Regular expressions

Without flags, regexes work on code units: `.` matches half an emoji and `[😀]` is a class of two surrogates. The **`u` flag** makes them code-point aware and enables `\u{1F600}` escapes and Unicode property escapes like `\p{L}` (any letter), `\p{Emoji_Presentation}` or `\p{Script=Cyrillic}`. The newer **`v` flag** adds set operations (`[\p{L}--[a-z]]`) and properties of strings such as `\p{RGI_Emoji}`, which matches multi-code-point emoji. `\w` and `\b` stay ASCII-only even with `u`, so use `\p{L}` and `\p{N}` for international text.

## Escapes and bytes

- `"é"` needs exactly four hex digits; `"\u{1F600}"` takes any code point.
- `String.raw` keeps backslashes: handy for regexes and Windows paths.
- Networks, files and hashes deal in **bytes**, usually UTF-8, where a character takes 1 to 4 bytes. `new TextEncoder().encode(str)` gives UTF-8 bytes (its `.length` is the byte size, which is what database column limits and HTTP headers care about), and `TextDecoder` goes back. `encodeURIComponent` percent-encodes UTF-8 bytes. `btoa` only accepts Latin-1, so encode to bytes first for Base64.

## Interview checklist

- Explain code units vs code points vs graphemes, and which APIs use which.
- Explain surrogate pairs and why `slice` or `split("")` can corrupt emoji.
- Count, truncate or reverse user-visible characters with `Intl.Segmenter`.
- Explain normalisation and when to apply it.
- Sort and compare strings correctly with `Intl.Collator`, and explain the `u` and `v` regex flags.
