The stranger is back, and this time she uses a stronger cipher: the **Vigenère cipher**. Instead of one shift for the whole text, every letter is shifted by an amount taken from a **key word**, which repeats over and over.

The key `LEMON` means the shifts `L = 11`, `E = 4`, `M = 12`, `O = 14`, `N = 13` (counting `A` as 0), and then `L = 11` again, and so on.

Implement two methods for texts and keys made of **capital English letters**:

- `Encrypt(text, key)` shifts the letters of the text forward by the shifts of the key, wrapping around the alphabet.
- `Decrypt(text, key)` shifts them back, restoring the text.

The rules:

- Anything that is not a capital letter (such as a space) is copied unchanged, and does **not** use up a letter of the key: the key moves on only after a letter has been encrypted.
- Build the result with a `StringBuilder`, not with `+=`.

Example, `ATTACK AT DAWN` with the key `LEMON` gives `LXFOPV EF RNHR`: `A + 11 = L`, `T + 4 = X`, `T + 12 = F`, and so on.

Do not change `Main`. Expected output:

```text
LXFOPV EF RNHR
ATTACK AT DAWN
HELLO
IFMMP
HELLO
```

Hint: keep a separate counter `k` for the key, and use `key[k % key.Length]` for the current key letter; increase `k` only when you process a letter.
