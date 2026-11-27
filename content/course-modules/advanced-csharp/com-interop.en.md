## What COM is

**COM** (Component Object Model) is Windows' binary standard for components: objects expose **interfaces** (identified by GUIDs) with a fixed vtable layout, are reference-counted (`AddRef`/`Release`), and are created through a registry-based factory (`CoCreateInstance`). Office, much of the Windows shell, DirectX and many legacy enterprise components are COM.

.NET Core 3.0+ supports COM interop on **Windows only**.

## Calling a COM component

### With an interop assembly

Tools (`tlbimp`, or "Add COM Reference" in Visual Studio) generate .NET interfaces from the component's type library. The runtime wraps each COM object in a **Runtime Callable Wrapper (RCW)**, which translates calls, manages the reference count and converts `HRESULT` errors into exceptions:

```csharp
var excel = new Microsoft.Office.Interop.Excel.Application();
excel.Visible = true;
var book = excel.Workbooks.Add();
var sheet = (Microsoft.Office.Interop.Excel.Worksheet)book.Worksheets[1];
sheet.Cells[1, 1] = "Total";
```

C# makes COM friendlier: **optional parameters** can be omitted (no more passing `Type.Missing` ten times), `ref` can be omitted for COM `ref` parameters, and **indexed properties** like `Range["A1"]` work.

### Late binding with dynamic

When you have no type library, `dynamic` binds through COM's `IDispatch`:

```csharp
Type? t = Type.GetTypeFromProgID("Excel.Application");
dynamic excel = Activator.CreateInstance(t!)!;
excel.Visible = true;
dynamic book = excel.Workbooks.Add();
book.Worksheets[1].Cells[1, 1].Value = "Total";
```

## Lifetimes and cleanup

An RCW releases the underlying COM object when it's finalized, which may be much later. For out-of-process servers like Excel, lingering references keep the process alive. Release deterministically when it matters:

```csharp
Marshal.ReleaseComObject(sheet);     // or Marshal.FinalReleaseComObject
excel.Quit();
```

Avoid "two dots" chains like `excel.Workbooks.Add()` in long-running automation: the intermediate `Workbooks` RCW is never released explicitly.

## Embedding interop types (NoPIA)

Historically you shipped large **Primary Interop Assemblies** with your app. With `<EmbedInteropTypes>true</EmbedInteropTypes>` (the default for COM references), the compiler copies only the interfaces and members you use into your own assembly, identified by GUID (**type equivalence**), so no PIA needs to be deployed.

## Exposing .NET objects to COM

A .NET class can be called by COM clients (VBA, VB6, native C++):

```csharp
[ComVisible(true)]
[Guid("6A1B2C3D-0000-4E5F-8A9B-0C1D2E3F4A5B")]
[ClassInterface(ClassInterfaceType.None)]
public class PriceCalculator : IPriceCalculator
{
    public double Calculate(double net, double rate) => net * (1 + rate);
}
```

The runtime creates a **COM Callable Wrapper (CCW)** around the object. In .NET Core you set `<EnableComHosting>true</EnableComHosting>` and register the generated `*.comhost.dll` with `regsvr32`. Expose explicit interfaces with fixed GUIDs, so the vtable doesn't change between versions.

.NET 8 adds `[GeneratedComInterface]`, a source generator for COM interop that works with trimming and AOT.

## Interview takeaways

- COM = interface-based binary components with reference counting; Windows-only interop in .NET.
- RCWs wrap COM objects for .NET; CCWs wrap .NET objects for COM.
- Optional parameters, indexed properties, `dynamic` and embedded interop types make COM much easier from C#; release out-of-process objects deterministically.
