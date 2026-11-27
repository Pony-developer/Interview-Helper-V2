import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const layoutTypes = (body: string) => `// How a native C header might declare these:
//   struct Header { uint8_t kind; int32_t length; int16_t flags; };        (natural alignment)
//   #pragma pack(1) struct PackedHeader { uint8_t kind; int32_t length; int16_t flags; };
[StructLayout(LayoutKind.Sequential)]
struct Header { public byte Kind; public int Length; public short Flags; }

[StructLayout(LayoutKind.Sequential, Pack = 1)]
struct PackedHeader { public byte Kind; public int Length; public short Flags; }

// A C union: both fields share the same 4 bytes.
[StructLayout(LayoutKind.Explicit)]
struct FloatBits
{
    [FieldOffset(0)] public float Value;
    [FieldOffset(0)] public uint Bits;
}

static class Native
{
    // Copies a struct into unmanaged memory and returns those bytes (Marshal.AllocHGlobal / StructureToPtr / Copy),
    // always freeing the unmanaged memory.
    public static byte[] ToBytes<T>(T value) where T : struct
    {
${body.split("@@")[0]}
    }

    // The reverse: copies bytes into unmanaged memory and reads a struct back with PtrToStructure.
    public static T FromBytes<T>(byte[] bytes) where T : struct
    {
${body.split("@@")[1]}
    }

    // The IEEE-754 bits of a float, read through the FloatBits union (no BitConverter).
    public static uint BitsOf(float value)
    {
${body.split("@@")[2]}
    }
}`;

const layoutSolution = [
  `        int size = Marshal.SizeOf(typeof(T));
        IntPtr ptr = Marshal.AllocHGlobal(size);
        try
        {
            Marshal.StructureToPtr(value, ptr, false);
            var bytes = new byte[size];
            Marshal.Copy(ptr, bytes, 0, size);
            return bytes;
        }
        finally
        {
            Marshal.FreeHGlobal(ptr);
        }`,
  `        IntPtr ptr = Marshal.AllocHGlobal(bytes.Length);
        try
        {
            Marshal.Copy(bytes, 0, ptr, bytes.Length);
            return (T)Marshal.PtrToStructure(ptr, typeof(T));
        }
        finally
        {
            Marshal.FreeHGlobal(ptr);
        }`,
  `        var u = new FloatBits();
        u.Value = value;
        return u.Bits;`,
].join("@@");

const layoutMain = `        Console.WriteLine("Header size: " + Marshal.SizeOf(typeof(Header)) + ", packed: " + Marshal.SizeOf(typeof(PackedHeader)));
        Console.WriteLine("Length offset: " + Marshal.OffsetOf(typeof(Header), "Length") + ", packed: " + Marshal.OffsetOf(typeof(PackedHeader), "Length"));

        var packed = new PackedHeader { Kind = 7, Length = 0x01020304, Flags = -2 };
        byte[] raw = Native.ToBytes(packed);
        Console.WriteLine(BitConverter.ToString(raw));
        PackedHeader back = Native.FromBytes<PackedHeader>(raw);
        Console.WriteLine(back.Kind + " " + back.Length.ToString("X") + " " + back.Flags);

        Console.WriteLine(Native.BitsOf(1.0f).ToString("X8") + " " + Native.BitsOf(-2.5f).ToString("X8"));`;

export const interopModule: ModuleDef = {
  slug: "interop",
  title: { en: "Native and COM interoperability", uk: "Взаємодія з нативним кодом і COM" },
  slides: [
    lecture("pinvoke", "Calling native DLLs with P/Invoke", "Виклик нативних DLL через P/Invoke"),
    lecture("marshaling", "Type and parameter marshaling, structs and unions", "Маршалінг типів і параметрів, структури та об'єднання"),
    lecture("callbacks-shared-memory", "Callbacks from native code and shared memory", "Зворотні виклики з нативного коду та спільна пам'ять"),
    lecture("com-interop", "COM interoperability", "Взаємодія з COM"),
    quiz("interop-quiz", "Native and COM interoperability", "Взаємодія з нативним кодом і COM", [
      question(
        "pinvoke",
        ["What does `[DllImport(\"user32.dll\")] static extern int MessageBox(...)` do?", "Що робить `[DllImport(\"user32.dll\")] static extern int MessageBox(...)`?"],
        [
          ["Copies the DLL into the assembly", "Копіює DLL у збірку"],
          ["Declares a managed signature for a native function; the runtime loads the DLL and marshals the arguments on each call", "Оголошує керовану сигнатуру для нативної функції; рантайм завантажує DLL і маршалить аргументи на кожен виклик"],
          ["Compiles C code", "Компілює код на C"],
          ["Creates a COM object", "Створює COM-об'єкт"],
        ],
        "b",
      ),
      question(
        "setlasterror",
        ["Why set `SetLastError = true` and read `Marshal.GetLastWin32Error()` instead of calling `GetLastError` yourself?", "Навіщо ставити `SetLastError = true` і читати `Marshal.GetLastWin32Error()`, а не викликати `GetLastError` самому?"],
        [
          ["It's faster", "Це швидше"],
          ["The runtime itself may call Win32 functions after your call and overwrite the error; SetLastError captures it immediately", "Рантайм сам може викликати функції Win32 після вашого виклику й перезаписати помилку; SetLastError зберігає її одразу"],
          ["GetLastError doesn't exist", "GetLastError не існує"],
          ["It's required for strings", "Це обов'язково для рядків"],
        ],
        "b",
      ),
      question(
        "layout",
        ["`[StructLayout(LayoutKind.Sequential)] struct S { byte A; int B; }` What is its unmanaged size, and why?", "`[StructLayout(LayoutKind.Sequential)] struct S { byte A; int B; }` Який її некерований розмір і чому?"],
        [
          ["5: one byte plus four", "5: один байт плюс чотири"],
          ["8: B is aligned to a 4-byte boundary, so 3 padding bytes follow A (Pack = 1 would make it 5)", "8: B вирівнюється на межу 4 байтів, тож за A йдуть 3 байти доповнення (Pack = 1 зробив би 5)"],
          ["16", "16"],
          ["It depends on the GC", "Залежить від GC"],
        ],
        "b",
      ),
      question(
        "union",
        ["How do you simulate a C union in C#?", "Як імітувати об'єднання (union) з C у C#?"],
        [
          ["With `[StructLayout(LayoutKind.Explicit)]` and `[FieldOffset(0)]` on fields that share memory", "Через `[StructLayout(LayoutKind.Explicit)]` і `[FieldOffset(0)]` на полях, що ділять пам'ять"],
          ["With inheritance", "Через успадкування"],
          ["With dynamic", "Через dynamic"],
          ["It's impossible", "Це неможливо"],
        ],
        "a",
      ),
      question(
        "callback-gc",
        ["You pass a delegate to native code as a callback that's called later. What must you ensure?", "Ви передаєте делегат у нативний код як зворотний виклик, що викликається пізніше. Що треба забезпечити?"],
        [
          ["Nothing", "Нічого"],
          ["That the delegate is static", "Що делегат статичний"],
          ["Keep a reference to the delegate alive (e.g. in a field) for as long as native code may call it, or the GC may collect it", "Тримати посилання на делегат живим (наприклад, у полі), поки нативний код може його викликати, інакше GC може його зібрати"],
          ["Mark it volatile", "Позначити його volatile"],
        ],
        "c",
      ),
      question(
        "libraryimport",
        ["What does `[LibraryImport]` (.NET 7) improve over `[DllImport]`?", "Що покращує `[LibraryImport]` (.NET 7) порівняно з `[DllImport]`?"],
        [
          ["It works without native DLLs", "Він працює без нативних DLL"],
          ["It calls COM objects", "Він викликає COM-об'єкти"],
          ["It makes calls asynchronous", "Він робить виклики асинхронними"],
          ["Marshaling code is generated at compile time by a source generator: faster and compatible with trimming and Native AOT", "Код маршалінгу генерує генератор коду під час компіляції: швидше й сумісно з trimming і Native AOT"],
        ],
        "d",
      ),
      question(
        "com",
        ["Which are true about COM interop in .NET?", "Що правда про взаємодію з COM у .NET?"],
        [
          ["The runtime wraps COM objects in Runtime Callable Wrappers (RCWs)", "Рантайм обгортає COM-об'єкти в Runtime Callable Wrappers (RCW)"],
          ["`dynamic` simplifies late-bound calls to IDispatch objects such as Office automation", "`dynamic` спрощує пізньо зв'язані виклики об'єктів IDispatch, як-от автоматизації Office"],
          ["Embedding interop types (NoPIA) avoids shipping primary interop assemblies", "Вбудовування типів interop (NoPIA) уникає постачання основних interop-збірок"],
          ["COM works the same on Linux", "COM однаково працює в Linux"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "strings",
        ["Why might a Windows API function exist as both `CreateFileA` and `CreateFileW`?", "Чому функція Windows API може існувати як `CreateFileA` і `CreateFileW`?"],
        [
          ["A is async, W is synchronous", "A — асинхронна, W — синхронна"],
          ["A takes ANSI (8-bit code page) strings, W takes UTF-16 \"wide\" strings; use `CharSet.Unicode` to bind to W", "A приймає рядки ANSI (8-бітна кодова сторінка), W — рядки UTF-16 («широкі»); `CharSet.Unicode` зв'язує з W"],
          ["A is for admins", "A — для адміністраторів"],
          ["They're identical", "Вони ідентичні"],
        ],
        "b",
      ),
    ]),
    practice("struct-layout-practice", "Struct layout, marshaling and unions", "Розкладка структур, маршалінг і об'єднання", {
      starter: PROGRAM_WITH(layoutTypes(`${TODO}@@${TODO}@@${TODO}`), layoutMain, "using System.Runtime.InteropServices;"),
      solution: PROGRAM_WITH(layoutTypes(layoutSolution), layoutMain, "using System.Runtime.InteropServices;"),
      expectedOutput: "Header size: 12, packed: 7\nLength offset: 4, packed: 1\n07-04-03-02-01-FE-FF\n7 1020304 -2\n3F800000 C0200000\n",
    }),
  ],
};
