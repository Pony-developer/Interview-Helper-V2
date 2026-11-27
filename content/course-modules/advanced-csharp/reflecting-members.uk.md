## Ієрархія членів

```
MemberInfo
 ├ Type
 ├ FieldInfo
 ├ PropertyInfo
 ├ EventInfo
 └ MethodBase
    ├ MethodInfo
    └ ConstructorInfo
```

```csharp
Type t = typeof(Order);
PropertyInfo[] props = t.GetProperties();                 // публічні властивості екземпляра + статичні
MethodInfo? m = t.GetMethod("AddLine", new[] { typeof(Product), typeof(int) });   // обрати перевантаження
FieldInfo? f = t.GetField("_lines", BindingFlags.NonPublic | BindingFlags.Instance);
MemberInfo[] all = t.GetMembers();
```

## BindingFlags

Без прапорців ви отримуєте **публічні** члени (екземпляра і статичні). З прапорцями треба вказати бажане за **обома** осями:

- видимість: `Public`, `NonPublic`;
- вид: `Instance`, `Static`;
- плюс `DeclaredOnly` (без успадкованих членів), `IgnoreCase`, `FlattenHierarchy` (успадковані статичні).

`GetMethods(BindingFlags.NonPublic)` сам по собі нічого не повертає, бо немає членів, які не є ні членами екземпляра, ні статичними.

## Читання та запис значень

```csharp
var order = new Order();
PropertyInfo total = typeof(Order).GetProperty("Total")!;
object? value = total.GetValue(order);
typeof(Order).GetProperty("Note")!.SetValue(order, "gift");

foreach (var p in typeof(Order).GetProperties().Where(p => p.CanRead))
    Console.WriteLine($"{p.Name} = {p.GetValue(order)}");   // саморобний ToString/дамп
```

## Виклик методів

```csharp
MethodInfo add = typeof(Order).GetMethod("AddLine")!;
add.Invoke(order, new object[] { pen, 3 });          // винятки приходять загорнуті в TargetInvocationException

MethodInfo generic = typeof(Enumerable).GetMethod("Empty")!.MakeGenericMethod(typeof(int));
var empty = (IEnumerable<int>)generic.Invoke(null, null)!;   // статичний: ціль — null
```

Параметри: `MethodInfo.GetParameters()` повертає об'єкти `ParameterInfo` (назва, тип, значення за замовчуванням, `IsOut`, атрибути). Аргументи `ref`/`out` записуються назад у переданий `object[]`.

## Продуктивність

Виклики через рефлексію **повільні**: масиви аргументів, пакування, перевірки безпеки й типів на кожному виклику (`Invoke` у десятки–сотні разів повільніший за прямий виклик). Стратегії:

1. **Кешуйте** пошук `Type`, `PropertyInfo` і `MethodInfo`; ніколи не шукайте їх у циклі.
2. Перетворіть `MethodInfo` на **типізований делегат** один раз, а потім викликайте на повній швидкості:

```csharp
var getter = (Func<Order, decimal>)Delegate.CreateDelegate(typeof(Func<Order, decimal>), total.GetGetMethod()!);
decimal sum = orders.Sum(getter);

var setter = typeof(Order).GetProperty("Note")!.GetSetMethod()!.CreateDelegate<Action<Order, string>>();   // .NET 5
```

3. Компілюйте **дерево виразів**, коли типи відомі лише під час виконання (див. модуль LINQ).
4. Для коду, відомого під час збирання, віддавайте перевагу **генераторам коду**.

## Атрибути через рефлексію

```csharp
var rule = type.GetCustomAttribute<RuleAttribute>();                       // null, якщо немає
bool hasIt = type.IsDefined(typeof(ObsoleteAttribute), inherit: false);    // дешева перевірка наявності
foreach (var p in type.GetProperties())
    if (p.GetCustomAttribute<RequiredAttribute>() is not null && p.GetValue(obj) is null) Fail(p.Name);
```

`GetCustomAttribute` створює новий екземпляр атрибута на кожен виклик; кешуйте результати.

## Що сказати на співбесіді

- `GetProperties/GetMethods/GetFields` з `BindingFlags` (видимість І екземпляр/статичний).
- `Invoke` загортає винятки в `TargetInvocationException` і повільний.
- Кешуйте результати рефлексії, а гарячі виклики перетворюйте на делегати чи скомпільовані вирази.
