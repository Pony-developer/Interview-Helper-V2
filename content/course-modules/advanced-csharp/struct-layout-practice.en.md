## Task

Interop is mostly about agreeing on **memory layout** with native code. The structs mirror a C header:

- `Header` uses natural alignment, so the `int` after the `byte` starts at offset 4 (3 padding bytes) and the struct is padded to 12 bytes;
- `PackedHeader` uses `Pack = 1` (like `#pragma pack(1)`): no padding, 7 bytes;
- `FloatBits` is a **union**: `[FieldOffset(0)]` on both fields makes them share the same 4 bytes.

Implement three helpers with `System.Runtime.InteropServices.Marshal`:

1. **`ToBytes<T>(value)`**: allocate `Marshal.SizeOf(typeof(T))` bytes of unmanaged memory with `AllocHGlobal`, `StructureToPtr` the value into it, `Marshal.Copy` it into a `byte[]`, and **always** `FreeHGlobal` in a `finally`.
2. **`FromBytes<T>(bytes)`**: the reverse: allocate, `Marshal.Copy` the bytes in, `PtrToStructure`, free.
3. **`BitsOf(float)`**: write the float into a `FloatBits` and read `Bits`: the raw IEEE-754 representation, with no `BitConverter`.

The byte dump shows the little-endian layout: `07` (Kind), `04-03-02-01` (Length 0x01020304), `FE-FF` (Flags -2).

Expected output:

```
Header size: 12, packed: 7
Length offset: 4, packed: 1
07-04-03-02-01-FE-FF
7 1020304 -2
3F800000 C0200000
```
