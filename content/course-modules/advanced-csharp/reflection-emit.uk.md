## Генерація коду під час виконання

Іноді найшвидший код залежить від інформації, що є лише під час виконання: форми типу для серіалізації, конфігурації мапінгу, динамічного проксі. .NET може **генерувати IL** на льоту й компілювати його JIT-ом у справжній машинний код.

Три рівні, від найзручнішого до найпотужнішого:

| Інструмент | Що пише | Типові користувачі |
| --- | --- | --- |
| Дерева виразів + `Compile()` | вирази (знання IL не потрібне) | мапери, провайдери запитів, швидкі гетери |
| `DynamicMethod` + `ILGenerator` | IL для одного методу | серіалізатори, динамічні викликачі |
| `AssemblyBuilder` / `TypeBuilder` (Reflection.Emit) | цілі типи в динамічній збірці | бібліотеки проксі (Castle DynamicProxy, Moq), ORM |

## DynamicMethod

```csharp
// будує: int Square(int x) => x * x;
var method = new DynamicMethod("Square", typeof(int), new[] { typeof(int) });
ILGenerator il = method.GetILGenerator();
il.Emit(OpCodes.Ldarg_0);   // покласти x
il.Emit(OpCodes.Ldarg_0);   // покласти x
il.Emit(OpCodes.Mul);       // перемножити два верхні значення
il.Emit(OpCodes.Ret);       // повернути вершину стеку

var square = (Func<int, int>)method.CreateDelegate(typeof(Func<int, int>));
Console.WriteLine(square(7));   // 49
```

IL — **стекова машина**: інструкції кладуть значення в стек обчислень і знімають з нього операнди. Локальні змінні оголошуються через `il.DeclareLocal(type)`, а розгалуження використовують мітки (`il.DefineLabel()`, `il.MarkLabel(label)`, `OpCodes.Brtrue`). `DynamicMethod` збирається GC, коли на нього більше немає посилань, а з `skipVisibility` він може звертатися до приватних членів.

## Генерація типів

```csharp
AssemblyBuilder asm = AssemblyBuilder.DefineDynamicAssembly(new AssemblyName("Dyn"), AssemblyBuilderAccess.RunAndCollect);
ModuleBuilder module = asm.DefineDynamicModule("Dyn");
TypeBuilder tb = module.DefineType("Greeter", TypeAttributes.Public);

MethodBuilder mb = tb.DefineMethod("Hello", MethodAttributes.Public, typeof(string), Type.EmptyTypes);
ILGenerator il = mb.GetILGenerator();
il.Emit(OpCodes.Ldstr, "Hello from emitted code");
il.Emit(OpCodes.Ret);

Type greeter = tb.CreateType()!;
object g = Activator.CreateInstance(greeter)!;
Console.WriteLine(greeter.GetMethod("Hello")!.Invoke(g, null));
```

Можна визначати поля, властивості, конструктори (не забудьте викликати базовий конструктор), параметри узагальнення й реалізовувати інтерфейси: так бібліотеки моків створюють під час виконання клас, що реалізує `IOrderService`.

## Як подивитися IL

Щоб зрозуміти, який IL генерувати, напишіть метод на C# і подивіться скомпільований IL в **ILSpy**, **dotPeek**, **SharpLab** чи `ildasm`. Скопіювати IL компілятора набагато легше, ніж писати з нуля. Бібліотеки на кшталт Mono.Cecil читають і переписують IL в наявних збірках (ними користуються «ткачі» на кшталт Fody).

## Обмеження

- Помилки виявляються лише під час виконання (`InvalidProgramException` для поганого IL).
- **Native AOT та iOS** не можуть виконувати JIT, тож Reflection.Emit там недоступний; trimming може видалити члени, на які покладається згенерований код.
- Це важко читати й супроводжувати.

Тому сучасний .NET дедалі більше переносить цю роботу на **час компіляції** за допомогою генераторів коду (наступна лекція).

## Що сказати на співбесіді

- Генерація коду під час виконання: дерева виразів (найпростіше), `DynamicMethod` (один метод IL), `TypeBuilder` (цілі типи).
- IL — набір стекових інструкцій; вивчайте його за виводом компілятора.
- Emit використовують проксі, серіалізатори та ORM; під Native AOT він не працює.
