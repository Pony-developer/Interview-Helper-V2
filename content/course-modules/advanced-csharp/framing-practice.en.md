## Task

TCP delivers a stream of bytes, not messages, and a `Read` may return fewer bytes than you asked for. `TrickleStream` simulates that: each `Read` returns at most a few bytes.

`Framing.WriteMessage` already writes each message as a **4-byte big-endian length** followed by the UTF-8 bytes. Implement **`Framing.ReadMessage(stream)`**:

1. Read **exactly 4** header bytes, looping over `Read` until you have them (a helper `ReadFully(stream, buffer, count)` that loops until `count` bytes or end of stream is useful).
   - If the stream ends **before any** header byte: return `null` (a clean end).
   - If it ends partway through the header: throw `EndOfStreamException("Truncated header")`.
2. Decode the big-endian length: `(b0 << 24) | (b1 << 16) | (b2 << 8) | b3`.
3. Read **exactly** that many body bytes (an empty message is valid); if the stream ends early, throw `EndOfStreamException("Truncated message")`.
4. Decode the body as UTF-8.

Expected output:

```
bytes on the wire: 43
[HELLO]
[ORDER 42: 3 × pens]
[]
[BYE]
error: Truncated message
```
