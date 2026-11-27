## Як отримати Type

`System.Type` описує тип: його назву, базовий тип, інтерфейси, члени, атрибути, аргументи узагальнення.

```csharp
Type a = typeof(Order);                     // тип, відомий під час компіляції
Type b = order.GetType();                   // тип екземпляра під час виконання (можливо, підклас)
Type? c = Type.GetType("Shop.Core.Order, Shop.Core");   // за ім'ям, кваліфікованим збіркою
Type d = typeof(Program).Assembly.GetType("Shop.Core.Order")!;
```

## Дослідження типу

```csharp
Type t = typeof(List<string>);
t.Name;                 // List`1
t.FullName;             // System.Collections.Generic.List`1[[System.String, ...]]
t.Namespace;            // System.Collections.Generic
t.BaseType;             // System.Object
t.IsClass; t.IsValueType; t.IsInterface; t.IsAbstract; t.IsSealed; t.IsEnum; t.IsPublic;
t.GetInterfaces();      // IList<string>, ICollection<string>, ...
t.IsAssignableTo(typeof(IEnumerable<string>));          // .NET 5; або typeof(IEnumerable<string>).IsAssignableFrom(t)
t.GetCustomAttributes(inherit: true);
```

`IsAssignableFrom` читається навпаки: `typeof(Base).IsAssignableFrom(typeof(Derived))` — true.

## Узагальнені типи

```csharp
Type open = typeof(Dictionary<,>);                          // незв'язане визначення узагальненого типу
Type closed = open.MakeGenericType(typeof(string), typeof(int));   // Dictionary<string, int>
closed.IsGenericType;               // true
closed.GetGenericTypeDefinition();  // Dictionary<,>
closed.GetGenericArguments();       // [String, Int32]
open.ContainsGenericParameters;     // true: екземпляр створити не можна
```

Щоб визначити «чи це будь-який `IRepository<T>`?», треба перевірити узагальнені інтерфейси:

```csharp
bool isRepo = t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRepository<>));
```

## Масиви, вкладені та nullable-типи

```csharp
typeof(int[]).GetElementType();          // Int32
typeof(int).MakeArrayType();             // Int32[]
typeof(Order.Line).DeclaringType;        // Order (вкладений тип)
Nullable.GetUnderlyingType(typeof(int?)); // Int32 або null для non-nullable типів
```

## Активація: створення екземплярів

```csharp
object o1 = Activator.CreateInstance(typeof(Order))!;                    // конструктор без параметрів
object o2 = Activator.CreateInstance(typeof(Money), 10m, "EUR")!;        // відповідний конструктор
T Create<T>() where T : new() => new T();                                 // узагальнено: під капотом компілюється в Activator

ConstructorInfo ctor = typeof(Money).GetConstructor(new[] { typeof(decimal), typeof(string) })!;
object o3 = ctor.Invoke(new object[] { 5m, "UAH" });
```

`Activator.CreateInstance` — те, як DI-контейнери, серіалізатори, хости плагінів і тестові фреймворки створюють об'єкти типів, відомих лише під час виконання.

## Рефлексія збірок

```csharp
Assembly asm = typeof(Program).Assembly;
IEnumerable<Type> handlers = asm.GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && typeof(IHandler).IsAssignableFrom(t));
```

`GetTypes` може кинути `ReflectionTypeLoadException`, якщо деякі типи посилаються на відсутні збірки; його властивість `Types` усе одно містить ті, що завантажилися. `GetExportedTypes` повертає лише публічні типи.

## Що сказати на співбесіді

- `typeof(T)` (час компіляції) проти `obj.GetType()` (тип під час виконання).
- `MakeGenericType`/`GetGenericTypeDefinition` працюють з відкритими й закритими узагальненнями.
- `Activator.CreateInstance` і `ConstructorInfo.Invoke` створюють об'єкти типів, відомих лише під час виконання.
