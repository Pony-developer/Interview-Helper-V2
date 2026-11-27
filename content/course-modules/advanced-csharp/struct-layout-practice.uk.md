## Завдання

Interop здебільшого зводиться до узгодження **розкладки пам'яті** з нативним кодом. Структури повторюють заголовок C:

- `Header` використовує природне вирівнювання, тож `int` після `byte` починається зі зсуву 4 (3 байти доповнення), а структура доповнюється до 12 байтів;
- `PackedHeader` використовує `Pack = 1` (як `#pragma pack(1)`): без доповнення, 7 байтів;
- `FloatBits` — **об'єднання**: `[FieldOffset(0)]` на обох полях змушує їх ділити ті самі 4 байти.

Реалізуйте три помічники через `System.Runtime.InteropServices.Marshal`:

1. **`ToBytes<T>(value)`**: виділіть `Marshal.SizeOf(typeof(T))` байтів некерованої пам'яті через `AllocHGlobal`, запишіть туди значення через `StructureToPtr`, скопіюйте в `byte[]` через `Marshal.Copy` і **завжди** викликайте `FreeHGlobal` у `finally`.
2. **`FromBytes<T>(bytes)`**: навпаки: виділіть, скопіюйте байти через `Marshal.Copy`, `PtrToStructure`, звільніть.
3. **`BitsOf(float)`**: запишіть float у `FloatBits` і прочитайте `Bits`: сире подання IEEE-754, без `BitConverter`.

Дамп байтів показує розкладку little-endian: `07` (Kind), `04-03-02-01` (Length 0x01020304), `FE-FF` (Flags -2).

Очікуваний результат:

```
Header size: 12, packed: 7
Length offset: 4, packed: 1
07-04-03-02-01-FE-FF
7 1020304 -2
3F800000 C0200000
```
