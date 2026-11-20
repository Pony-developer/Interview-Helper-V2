---
skill: js-values-grammar
title: "Values and grammar: numbers, natives and the rules of syntax"
summary: "How JavaScript numbers work (IEEE 754, precision, safe integers, BigInt, -0, NaN, rounding), strings and arrays as values, native wrapper objects, statements vs expressions, automatic semicolon insertion, operator precedence, labels and other grammar corners."
readingMinutes: 9
---

Type coercion gets most of the attention, but many bugs come from the values themselves (why is `0.1 + 0.2` not `0.3`?) and from the grammar (why does `return` on its own line return `undefined`?). This lecture covers both.

## Numbers are 64-bit floats

Every `number` is an IEEE 754 double: 52 bits of fraction, an exponent and a sign. Consequences:

- **Binary fractions can't represent most decimals exactly**: `0.1 + 0.2` is `0.30000000000000004`. Compare with a tolerance (`Math.abs(a - b) < Number.EPSILON` for values near 1) or, for money, work in integer cents.
- **Integers are exact only up to `Number.MAX_SAFE_INTEGER`** (2⁵³ − 1 = 9,007,199,254,740,991). Beyond that, `2 ** 53 === 2 ** 53 + 1` is `true`. Large IDs from APIs (Twitter, databases) must stay strings, or use **`BigInt`** (`9007199254740993n`). BigInts can't be mixed with numbers in arithmetic without explicit conversion.
- **Rounding surprises**: `(1.005).toFixed(2)` is `"1.00"` because 1.005 is actually stored as 1.00499999…; `Math.round(-2.5)` is `-2` (rounds towards +∞ at .5). Use `Intl.NumberFormat` for display and integer arithmetic for calculations.
- **`NaN`** ("not a number") is a number that isn't equal to itself. Test with `Number.isNaN(x)`; the global `isNaN("abc")` coerces first and returns `true`.
- **`-0`** exists: `-0 === 0` is `true`, but `Object.is(-0, 0)` is `false` and `1 / -0` is `-Infinity`. `String(-0)` and `JSON.stringify(-0)` both give `"0"`. It matters when a sign carries meaning (direction of movement).
- Number literals: `1_000_000` (separators), `0xff`, `0o17`, `0b1010`, `1e-7`.

## Strings and arrays as values

- **Strings are immutable** primitives: methods like `toUpperCase` and `replace` return new strings; `str[0] = "x"` does nothing. Strings are sequences of UTF-16 code units, so `"😀".length` is 2; iterate with `for…of` or `[...str]` to get code points, and use `Intl.Segmenter` for user-perceived characters.
- **Arrays are objects** with numeric keys and a `length`. Assigning beyond the end creates **holes** (`const a = [1, , 3]`): `forEach`, `map`, `filter` and `indexOf` skip holes, while `for…of`, spread and `includes` treat them as `undefined`. Avoid holes and avoid `delete arr[i]`; use `splice` or `filter`.
- Primitives are passed by value; objects (including arrays and functions) are passed as **references** by value: a function can mutate the object you passed, but reassigning its parameter doesn't affect your variable.

## Natives and wrapper objects

`String`, `Number` and `Boolean` called **without** `new` convert values (`Number("42")`). Called **with** `new`, they create wrapper objects, which are almost always a mistake: `new Boolean(false)` is an object and therefore truthy, `typeof new String("a")` is `"object"`, and `"a" === new String("a")` is `false`. When you call a method on a primitive (`"abc".toUpperCase()`), JavaScript temporarily boxes it for you. `Object.prototype.toString.call(value)` gives a reliable type tag (`[object Array]`, `[object Null]`, `[object Date]`).

## Statements vs expressions

Expressions produce values (`a + 1`, `fn()`, `cond ? x : y`); statements perform actions (`if`, `for`, `return`, declarations). Some contexts accept only expressions: JSX `{…}`, template `${…}`, arrow function bodies without braces. That's why `() => { a: 1 }` returns `undefined` (the braces are a block with a label `a:`) and you must write `() => ({ a: 1 })`.

## Automatic semicolon insertion (ASI)

When a line break appears where the grammar can't continue, the parser inserts a semicolon. Two consequences matter:

```js
return          // ASI inserts a semicolon here
  { ok: true }; // unreachable: the function returns undefined
```

- Never put a line break after `return`, `throw`, `break`, `continue`, `yield` or before postfix `++`/`--`.
- If you omit semicolons, a line starting with `(`, `[` or `` ` `` continues the previous line (`const a = b\n(function(){})()` calls `b`). Linters and Prettier handle this for you.

## Operator precedence and grouping

- `&&` binds tighter than `||`: `a || b && c` is `a || (b && c)`.
- `+` is left-associative: `1 + 2 + "3"` is `"33"`, while `"1" + 2 + 3` is `"123"`.
- `**` is right-associative, and `-2 ** 2` is a `SyntaxError` (write `(-2) ** 2`).
- Mixing `??` with `||` or `&&` without parentheses is a `SyntaxError`: write `(a || b) ?? c`.
- The comma operator evaluates both sides and yields the right one: `(1, 2, 3)` is `3`.
- When in doubt, add parentheses: readability beats clever precedence.

## Labels and other corners

- Labels name a loop so `break`/`continue` can target it: `outer: for (…) { for (…) { if (x) continue outer; } }`.
- `typeof` an undeclared variable returns `"undefined"` without throwing (useful for feature detection), but inside the temporal dead zone of a `let`/`const` it throws.
- `void expr` evaluates the expression and returns `undefined`.
- Strict mode (`"use strict"`, and always inside modules and classes) turns silent failures into errors: assigning to undeclared variables, writing read-only properties, duplicate parameter names.

## Interview checklist

- Explain `0.1 + 0.2`, safe integers, BigInt and how to handle money.
- Know `NaN`, `Number.isNaN`, and the `-0` corner cases.
- Explain string immutability, UTF-16 length, and array holes.
- Explain why `new Boolean(false)` is truthy.
- Spot ASI bugs after `return` and precedence bugs with `||`/`&&`/`??`.
