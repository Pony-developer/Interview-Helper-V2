## Зворотні виклики з нативного коду

Багато нативних API викликають **вас** у відповідь: функції перелічення, хуки подій, компаратори для сортування. Передайте делегат, чия сигнатура відповідає нативному вказівнику на функцію:

```csharp
delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

[DllImport("user32.dll")]
static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

EnumWindows((hWnd, _) =>
{
    Console.WriteLine(hWnd);
    return true;                 // продовжити перелічення
}, IntPtr.Zero);
```

Маршалер створює для делегата **перехідник** (thunk), який може викликати нативний код.

### Як тримати делегат живим

Якщо нативний код зберігає колбек і викликає його **пізніше** (після повернення з P/Invoke), GC про це посилання не знає. Делегат можуть зібрати, і наступний нативний виклик обвалить процес («CallbackOnCollectedDelegate»). Тримайте посилання, доки нативний код може його викликати:

```csharp
private static readonly LogCallback KeepAlive = OnNativeLog;   // статичне поле тримає його
static void Init() => register_log_callback(KeepAlive);
```

### Вказівники на функції та UnmanagedCallersOnly

Вказівники на функції з C# 9 і `[UnmanagedCallersOnly]` дозволяють нативному коду напряму викликати **статичний метод** без делегата й без алокації перехідника:

```csharp
[UnmanagedCallersOnly(CallConvs = new[] { typeof(CallConvCdecl) })]
static int Compare(int* a, int* b) => *a - *b;

unsafe
{
    delegate* unmanaged[Cdecl]<int*, int*, int> cmp = &Compare;
    qsort(array, (nuint)count, sizeof(int), cmp);
}
```

Винятки ніколи не мають виходити з колбеку в нативний код: перехоплюйте все всередині.

## Угоди про виклики

`CallingConvention.StdCall` (стандарт Win32 на x86), `Cdecl` (бібліотеки C на x86), а на x64/ARM64 по суті одна угода. Невідповідність на 32-бітному x86 псує стек.

## Спільна пам'ять із нативним кодом

- **Закріплення**: інструкції `fixed` чи `GCHandle.Alloc(obj, GCHandleType.Pinned)` тримають керований буфер за фіксованою адресою, поки ним користується нативний код. Знімайте закріплення (`handle.Free()`) якомога швидше.
- **Нативна алокація**: `Marshal.AllocHGlobal`/`NativeMemory.Alloc` дають пам'ять, яку GC ніколи не переміщує; копіюйте дані туди й назад через `Marshal.Copy` або обгорніть її в `Span<T>`.
- **Відображення структури на нативну пам'ять**: `Marshal.PtrToStructure<T>(ptr)` копіює нативні байти в структуру; `Marshal.StructureToPtr(value, ptr, false)` — у зворотному напрямку. З `unsafe`-вказівником на blittable-структуру поля можна читати й писати на місці, без копіювання.
- **Між процесами**: файли, відображені в пам'ять (див. модуль про потоки), з розкладкою структури, про яку домовилися обидві сторони.

```csharp
IntPtr buffer = Marshal.AllocHGlobal(Marshal.SizeOf<SystemTime>());
try
{
    get_time(buffer);
    SystemTime t = Marshal.PtrToStructure<SystemTime>(buffer);
}
finally
{
    Marshal.FreeHGlobal(buffer);
}
```

## Що сказати на співбесіді

- Нативні колбеки приймають делегати (або вказівники на функції з `UnmanagedCallersOnly`).
- Тримайте делегати колбеків досяжними, поки нативний код може їх викликати; ніколи не випускайте винятки в нативний код.
- Закріплюйте ненадовго або використовуйте нативну пам'ять плюс `Marshal.Copy`/`PtrToStructure`, щоб ділитися даними.
