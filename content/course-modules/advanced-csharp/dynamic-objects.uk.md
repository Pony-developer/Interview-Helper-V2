## Dynamic Language Runtime

**DLR** — шар поверх CLR, на якому працюють `dynamic` у C# і мови на кшталт IronPython. Він дає:

- **місця виклику** (`CallSite<T>`), які компілятор генерує для кожної динамічної операції;
- **зв'язувачі** (binders), що вирішують, що означає операція для конкретного типу під час виконання;
- **кеш** скомпільованих правил для кожного місця виклику, тож після першого виклику для типу наступні виконують швидку перевірку типу плюс закешований код.

## Три способи зв'язати об'єкт

Коли ви викликаєте `d.Foo()` на `dynamic d`, зв'язувач перевіряє:

1. Чи реалізує об'єкт **`IDynamicMetaObjectProvider`**? Тоді вирішує сам об'єкт (власне зв'язування): `ExpandoObject`, підкласи `DynamicObject`, об'єкти IronPython, JSON DOM.
2. Чи це **COM**-об'єкт? Тоді COM-зв'язування через `IDispatch` (автоматизація Office).
3. Інакше — **мовне зв'язування**: правила C#, застосовані до типу під час виконання (вибір перевантаження, оператори, перетворення).

## ExpandoObject

```csharp
dynamic customer = new ExpandoObject();
customer.Name = "Ann";
customer.Tags = new List<string> { "vip" };
customer.Describe = (Func<string>)(() => $"{customer.Name} ({customer.Tags.Count} tags)");
Console.WriteLine(customer.Describe());

var asDict = (IDictionary<string, object?>)customer;    // члени — це просто записи словника
foreach (var (key, value) in asDict) Console.WriteLine(key);
((INotifyPropertyChanged)customer).PropertyChanged += (_, e) => Console.WriteLine(e.PropertyName);
```

## DynamicObject: власна динамічна поведінка

Перевизначайте лише потрібні операції; решта падатимуть з `RuntimeBinderException`.

```csharp
public class ConfigBag : DynamicObject
{
    private readonly Dictionary<string, string> _values = new(StringComparer.OrdinalIgnoreCase);

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = _values.TryGetValue(binder.Name, out var v) ? v : null;
        return true;                                   // відсутні ключі дають null замість винятку
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        _values[binder.Name] = value?.ToString() ?? "";
        return true;
    }

    public override bool TryInvokeMember(InvokeMemberBinder binder, object?[]? args, out object? result)
    {
        if (binder.Name == "Has") { result = _values.ContainsKey((string)args![0]!); return true; }
        return base.TryInvokeMember(binder, args, out result);
    }

    public override IEnumerable<string> GetDynamicMemberNames() => _values.Keys;   // для налагоджувачів
}

dynamic cfg = new ConfigBag();
cfg.Timeout = 30;
Console.WriteLine(cfg.TIMEOUT);         // "30": без урахування регістру
Console.WriteLine(cfg.Has("timeout"));  // True
```

Інші гачки для перевизначення: `TryInvoke` (виклик об'єкта як функції), `TryGetIndex`/`TrySetIndex` (`d[...]`), `TryBinaryOperation` (`d + x`), `TryConvert` (`(int)d`).

## Уніфікація чисел і динамічні перевантаження

Мовне зв'язування застосовує правила C# до **справжніх** типів:

```csharp
static dynamic Sum(IEnumerable<dynamic> values)
{
    dynamic total = 0;
    foreach (var v in values) total += v;     // int + int, потім int + double → double, decimal + decimal...
    return total;
}
```

А перевантаження обираються за типами під час виконання, що дає простий **visitor / множинну диспетчеризацію**:

```csharp
string Describe(Circle c) => $"circle r={c.R}";
string Describe(Square s) => $"square a={s.A}";
foreach (Shape s in shapes) Console.WriteLine(Describe((dynamic)s));
```

## Взаємодія з динамічними мовами

Хостинг IronPython дозволяє користувачам писати скрипти для вашого застосунку: ви передаєте .NET-об'єкти в Python і отримуєте назад `dynamic`-об'єкти Python, члени яких викликаєте природно. Сьогодні цю нішу частіше займають вбудовані рушії JavaScript або скрипти Roslyn (`CSharpScript.EvaluateAsync`).

## Що сказати на співбесіді

- DLR додає місця виклику, зв'язувачі й кешування для кожного місця поверх CLR.
- `ExpandoObject` = члени, додані під час виконання; `DynamicObject` = ви визначаєте, що означає доступ до члена.
- Мовне зв'язування дає уніфікацію чисел і вибір перевантаження під час виконання; усе падає лише під час виконання.
