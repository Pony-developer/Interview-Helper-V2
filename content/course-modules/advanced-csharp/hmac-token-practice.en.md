## Task

Build signed tokens, the idea behind signed cookies, webhook signatures and HS256 JWTs. A token is `<base64url payload>.<base64url signature>`, where the signature is the **HMAC-SHA256** of the first part. The base64url helpers are provided.

1. **`Sign(payload, key)`**: base64url-encode the UTF-8 payload, compute `HMACSHA256(key)` over the ASCII bytes of that encoded part, and return `encoded + "." + base64url(signature)`.
2. **`FixedTimeEquals(a, b)`**: return false for different lengths; otherwise XOR every pair of bytes into an accumulator and return `accumulator == 0`. Don't stop at the first difference: that would leak timing information.
3. **`Verify(token, key)`**: split at the first `.` (return null if there's none); decode the signature (return null on a `FormatException`); recompute the expected HMAC over the payload part; compare with `FixedTimeEquals`; return the decoded payload when valid, otherwise null.

The last line prints the well-known SHA-256 of `hello`.

Expected output:

```
eyJ1c2VyIjo0Miwicm9sZSI6ImFkbWluIn0.ktHOuCRK4-ZP69XfHeeekiiUgIwhdxfj9PUKWWxlq3I
{"user":42,"role":"admin"}
rejected: payload changed
rejected: wrong key
rejected: malformed
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
```
