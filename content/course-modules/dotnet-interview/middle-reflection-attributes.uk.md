## Рефлексія в п'ятьох викликах (П84)

```csharp
Type t = typeof(Order);                                        // або order.GetType() для типу під час виконання
PropertyInfo[] props = t.GetProperties(BindingFlags.Public | BindingFlags.Instance);
object? value = props[0].GetValue(order);                      // прочитати властивість
MethodInfo m = t.GetMethod("Pay")!;
m.Invoke(order, new object[] { 100m });                        // викликати метод
object instance = Activator.CreateInstance(typeof(Order))!;    // створити об'єкт
```

А також: `Assembly.GetTypes()` для пошуку плагінів, `t.GetInterfaces()`, `t.IsAssignableTo(typeof(IHandler))`, `t.GetGenericArguments()`, `typeof(Repository<>).MakeGenericType(typeof(Order))`.

Де використовується: серіалізатори (JSON, XML), ORM (відображення колонок на властивості), DI-контейнери (пошук конструкторів), тестові фреймворки (пошук методів `[Fact]`), прив'язка моделей і пошук контролерів в ASP.NET Core, мапери (AutoMapper, Mapster), валідація (FluentValidation, DataAnnotations).

## Атрибути

```csharp
[AttributeUsage(AttributeTargets.Property)]
public sealed class SensitiveAttribute : Attribute { }

public class User
{
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [Sensitive] public string PasswordHash { get; set; } = "";
}

bool hide = prop.GetCustomAttribute<SensitiveAttribute>() is not null;
```

Атрибут — це метадані, збережені у збірці. Сам по собі він нічого не робить; його має прочитати якийсь код (компілятор, рантайм, фреймворк або ваша рефлексія). Вбудовані приклади: `[Obsolete]` (попередження компілятора), `[Serializable]`, `[DllImport]`/`[LibraryImport]` (взаємодія з нативним кодом), `[Flags]`, `[CallerMemberName]` (компілятор підставляє аргумент), `[Authorize]`, `[HttpGet]`, `[JsonPropertyName]`.

## Продуктивність і альтернативи

Рефлексія повільна порівняно з прямими викликами: пошук за назвою, перевірки безпеки, упакування аргументів і результатів, без вбудовування. Варіанти від найповільнішого до найшвидшого:

1. `MethodInfo.Invoke` / `PropertyInfo.GetValue` на кожному виклику.
2. Кешувати об'єкти `PropertyInfo` / `MethodInfo` (пошук один раз).
3. Один раз збудувати типізований делегат: `(Func<Order, decimal>)Delegate.CreateDelegate(...)` або скомпільоване дерево виразів.
4. **Генератори коду**: код генерується під час компіляції (`JsonSerializerContext` у System.Text.Json, `[LoggerMessage]`, `[GeneratedRegex]`, Mapperly) — без рефлексії під час виконання й сумісно з trimming та **Native AOT**, де рефлексія над невідомими типами може просто не працювати.

## Небезпеки

- Рефлексія ігнорує `private`: це не межа безпеки, і вона ламає інкапсуляцію — код, що читає приватні поля, ламається, коли клас змінюється.
- Перейменування властивості тихо ламає пошук за рядком: використовуйте `nameof(Order.Total)`.
- Trimmer прибирає члени, які вважає невикористаними; коду з активною рефлексією потрібні анотації (`[DynamicallyAccessedMembers]`).

## Типові задачі на співбесіді

- «Скопіюйте однойменні властивості із сутності в DTO» (практика).
- «Знайдіть усі класи, що реалізують `IHandler<T>`, і зареєструйте їх у DI».
- «Надрукуйте всі властивості об'єкта, маскуючи позначені атрибутом» (практика).
- «Викличте приватний метод у модульному тесті» — можливо, але це ознака, що дизайну потрібна точка розширення.
