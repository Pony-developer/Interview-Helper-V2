---
skill: json-serialization
title: "JSON and serialization: what survives the round trip"
summary: "JSON's data model and how JavaScript values map onto it, the exact rules of JSON.stringify for undefined, functions, symbols, NaN, BigInt, dates and cycles, toJSON, replacers and indentation, revivers in JSON.parse, safely parsing untrusted input, prototype pollution, large payloads, and validating data at the boundary."
readingMinutes: 10
---

JSON is the lingua franca of APIs, configuration and storage, and `JSON.stringify` and `JSON.parse` look trivial. But JSON's data model is smaller than JavaScript's, so every round trip silently converts or drops values. Knowing the rules prevents lost fields, wrong types and, with untrusted input, security bugs.

## JSON's data model

JSON has objects (string keys), arrays, strings, numbers (finite only), `true`, `false` and `null`. No `undefined`, functions, symbols, dates, `Map`/`Set`, `BigInt`, `NaN` or `Infinity`, comments or trailing commas. Keys and strings must use double quotes.

## What `JSON.stringify` does with each value

| Value | In an object property | In an array | At the top level |
| --- | --- | --- | --- |
| `undefined`, function, symbol | property **omitted** | becomes `null` | returns `undefined` (not a string) |
| `NaN`, `Infinity` | `null` | `null` | `"null"` |
| `Date` | ISO string (via `Date.prototype.toJSON`) | same | same |
| `Map`, `Set`, class instances | own enumerable properties only, so usually `{}` | same | same |
| `BigInt` | **throws** a `TypeError` | throws | throws |
| circular reference | **throws** a `TypeError` | throws | throws |

Symbol-keyed and non-enumerable properties are skipped, and getters are called. Property order follows the object's own key order (integer-like keys first).

## Customising output

- **`toJSON()`**: if a value has a `toJSON` method, `stringify` serialises its return value instead. That's how `Date` becomes a string, and how you can give classes a stable wire format.
- **Replacer function** `(key, value) => newValue`: called for every key, depth-first, with `this` set to the containing object; returning `undefined` drops the property. The first call has key `""` for the root. Use it to redact secrets or convert `BigInt`s to strings.
- **Replacer array**: a whitelist of property names to include.
- **`space`**: a number (up to 10) or string for indentation.

## Parsing and revivers

`JSON.parse(text, reviver)` throws a `SyntaxError` on invalid input, so wrap untrusted text in `try/catch`. The optional **reviver** is called bottom-up for every key; use it to restore types (ISO strings back to `Date`, tagged values back to `BigInt` or `Map`). Returning `undefined` from the reviver deletes the property.

## Untrusted input

- **Validate the shape** after parsing. `JSON.parse` only guarantees syntax, so an API can still send `{"age": "ten"}`. Use a schema validator (Zod, Valibot, Ajv with JSON Schema) at every boundary: requests, responses, `localStorage`, queues.
- **Prototype pollution**: `JSON.parse('{"__proto__": {"admin": true}}')` creates an own property named `__proto__`, which is harmless by itself. But a naive deep-merge that copies it with `target[key] = …` writes to `Object.prototype` and gives **every** object `admin: true`. Skip `__proto__`, `constructor` and `prototype` keys when merging, or build results with `Object.create(null)` or `Map`.
- **Size and depth**: huge or deeply nested payloads can exhaust memory or the stack. Limit request body sizes on the server.
- Never use `eval` to parse JSON.

## Big data and alternatives

- `JSON.parse` of a large payload blocks the main thread; stream it (NDJSON, a streaming parser) or parse in a worker.
- Numbers beyond `Number.MAX_SAFE_INTEGER` lose precision on parse, so send 64-bit ids as **strings**.
- `structuredClone` copies more types but isn't a wire format; binary formats (MessagePack, Protocol Buffers, CBOR) are smaller and faster but need schemas or libraries.

## Interview checklist

- List what `JSON.stringify` drops, converts to `null`, or throws on, and where (object, array, top level).
- Explain `toJSON`, replacer functions and arrays, and revivers, with a date or BigInt example.
- Explain why parsed JSON must be validated, and how prototype pollution happens.
- Explain how to handle cycles, large numbers and large payloads.
