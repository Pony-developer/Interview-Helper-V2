## Що таке COM

**COM** (Component Object Model) — двійковий стандарт компонентів Windows: об'єкти відкривають **інтерфейси** (ідентифіковані GUID) з фіксованою розкладкою vtable, мають лічильник посилань (`AddRef`/`Release`) і створюються через фабрику на основі реєстру (`CoCreateInstance`). Office, значна частина оболонки Windows, DirectX і багато застарілих корпоративних компонентів — це COM.

.NET Core 3.0+ підтримує взаємодію з COM **лише в Windows**.

## Виклик COM-компонента

### Через interop-збірку

Інструменти (`tlbimp` або «Add COM Reference» у Visual Studio) генерують .NET-інтерфейси з бібліотеки типів компонента. Рантайм обгортає кожен COM-об'єкт у **Runtime Callable Wrapper (RCW)**, що перекладає виклики, керує лічильником посилань і перетворює помилки `HRESULT` на винятки:

```csharp
var excel = new Microsoft.Office.Interop.Excel.Application();
excel.Visible = true;
var book = excel.Workbooks.Add();
var sheet = (Microsoft.Office.Interop.Excel.Worksheet)book.Worksheets[1];
sheet.Cells[1, 1] = "Total";
```

C# робить COM дружнішим: **необов'язкові параметри** можна пропускати (більше не треба десять разів передавати `Type.Missing`), `ref` можна пропускати для COM-параметрів `ref`, і працюють **індексовані властивості** на кшталт `Range["A1"]`.

### Пізнє зв'язування через dynamic

Коли бібліотеки типів немає, `dynamic` зв'язується через `IDispatch` COM:

```csharp
Type? t = Type.GetTypeFromProgID("Excel.Application");
dynamic excel = Activator.CreateInstance(t!)!;
excel.Visible = true;
dynamic book = excel.Workbooks.Add();
book.Worksheets[1].Cells[1, 1].Value = "Total";
```

## Час життя та прибирання

RCW звільняє COM-об'єкт під ним, коли сам фіналізується, а це може статися набагато пізніше. Для позапроцесних серверів на кшталт Excel посилання, що лишилися, тримають процес живим. Коли це важливо, звільняйте детерміновано:

```csharp
Marshal.ReleaseComObject(sheet);     // або Marshal.FinalReleaseComObject
excel.Quit();
```

Уникайте ланцюжків «через дві крапки» на кшталт `excel.Workbooks.Add()` у довготривалій автоматизації: проміжний RCW `Workbooks` ніколи не звільняється явно.

## Вбудовування типів interop (NoPIA)

Історично разом із застосунком постачали великі **Primary Interop Assemblies**. З `<EmbedInteropTypes>true</EmbedInteropTypes>` (за замовчуванням для COM-посилань) компілятор копіює у вашу збірку лише ті інтерфейси й члени, які ви використовуєте, ідентифікуючи їх за GUID (**еквівалентність типів**), тож PIA розгортати не треба.

## Відкриття .NET-об'єктів для COM

.NET-клас можуть викликати COM-клієнти (VBA, VB6, нативний C++):

```csharp
[ComVisible(true)]
[Guid("6A1B2C3D-0000-4E5F-8A9B-0C1D2E3F4A5B")]
[ClassInterface(ClassInterfaceType.None)]
public class PriceCalculator : IPriceCalculator
{
    public double Calculate(double net, double rate) => net * (1 + rate);
}
```

Рантайм створює навколо об'єкта **COM Callable Wrapper (CCW)**. У .NET Core встановлюють `<EnableComHosting>true</EnableComHosting>` і реєструють згенерований `*.comhost.dll` через `regsvr32`. Відкривайте явні інтерфейси з фіксованими GUID, щоб vtable не змінювалася між версіями.

.NET 8 додає `[GeneratedComInterface]` — генератор коду для COM interop, що працює з trimming і AOT.

## Що сказати на співбесіді

- COM = двійкові компоненти на інтерфейсах з лічильником посилань; у .NET взаємодія лише для Windows.
- RCW обгортають COM-об'єкти для .NET; CCW обгортають .NET-об'єкти для COM.
- Необов'язкові параметри, індексовані властивості, `dynamic` і вбудовані типи interop значно спрощують COM з C#; позапроцесні об'єкти звільняйте детерміновано.
