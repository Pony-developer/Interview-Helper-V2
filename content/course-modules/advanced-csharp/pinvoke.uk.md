## Platform Invoke

**P/Invoke** дозволяє керованому коду викликати функції, які експортують нативні бібліотеки: Windows API (`kernel32`, `user32`), рантайм C (`libc`) чи ваші власні DLL на C/C++/Rust.

```csharp
using System.Runtime.InteropServices;

static class Win32
{
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern uint GetCurrentDirectory(uint bufferLength, char[] buffer);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int MessageBox(IntPtr hWnd, string text, string caption, uint type);
}

Win32.MessageBox(IntPtr.Zero, "Hello from C#", "P/Invoke", 0);
```

Ви оголошуєте метод `static extern` з нативною сигнатурою; рантайм:

1. завантажує бібліотеку (шукаючи в теці застосунку, системних теках, `LD_LIBRARY_PATH` у Linux; розширення можна не вказувати, і він додасть `.dll`/`.so`/`.dylib`);
2. знаходить точку входу (за назвою методу або `EntryPoint = "..."`);
3. **маршалить** аргументи з керованого подання в нативне, викликає функцію й маршалить результати назад.

## Помилки

Нативні функції зазвичай повідомляють про помилки через коди повернення плюс локальну для потоку «останню помилку». Використовуйте `SetLastError = true` і читайте її одразу після виклику:

```csharp
[DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
static extern bool DeleteFile(string path);

if (!DeleteFile(@"C:\missing.txt"))
    throw new Win32Exception(Marshal.GetLastWin32Error());   // "The system cannot find the file specified"
```

Рантайм зберігає помилку одразу; власний виклик `GetLastError` пізніше може прочитати значення, перезаписане викликами самого рантайму.

## Дескриптори

Нативні ресурси повертаються як дескриптори (`IntPtr`). Вкажіть підклас `SafeHandle` як тип результату, і маршалер обгорне їх за вас:

```csharp
[DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
static extern SafeFileHandle CreateFile(string name, uint access, uint share, IntPtr security,
                                        uint creation, uint flags, IntPtr template);
```

`SafeHandle` гарантує звільнення навіть при винятках чи перериванні потоків і запобігає атакам із повторним використанням дескрипторів.

## LibraryImport (.NET 7)

```csharp
static partial class Native
{
    [LibraryImport("libc", EntryPoint = "getpid")]
    internal static partial int GetPid();

    [LibraryImport("kernel32.dll", SetLastError = true, StringMarshalling = StringMarshalling.Utf16)]
    [return: MarshalAs(UnmanagedType.Bool)]
    internal static partial bool DeleteFileW(string path);
}
```

Генератор коду пише код маршалінгу під час компіляції: жодної генерації IL-заглушок під час виконання, краща продуктивність, і це працює з Native AOT та trimming. Для нового коду віддавайте перевагу йому.

## Кросплатформні поради

- Використовуйте перевірки `OperatingSystem.IsWindows()` / `IsLinux()` або `NativeLibrary.SetDllImportResolver`, щоб зіставляти назви бібліотек для кожної платформи.
- Нативні бібліотеки мають відповідати архітектурі процесу (x64 чи ARM64).
- Пакуйте нативні двійкові файли за ідентифікатором рантайму в `runtimes/{rid}/native/` у NuGet-пакетах.

## Коли уникати P/Invoke

Кожен виклик має ціну (маршалінг аргументів, перехід GC) і ризик (неправильна сигнатура псує пам'ять чи обвалює процес). Спершу перевірте, чи .NET уже обгортає цей API; віддавайте перевагу нативним API, що працюють пакетами, а не «балакучим».

## Що сказати на співбесіді

- `[DllImport]`/`[LibraryImport]` + `static extern` оголошують нативну функцію; рантайм завантажує й маршалить.
- `SetLastError = true` + `Marshal.GetLastWin32Error()` — для кодів помилок; `SafeHandle` — для нативних дескрипторів.
- `LibraryImport` генерує маршалінг під час компіляції й працює з Native AOT.
