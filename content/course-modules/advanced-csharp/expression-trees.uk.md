## Код як дані

Присвойте лямбду `Expression<TDelegate>`, і компілятор замість IL побудує **дерево об'єктів**, що її описує:

```csharp
Func<int, bool> f = x => x > 5;                    // скомпільований код
Expression<Func<int, bool>> e = x => x > 5;        // структура даних

Console.WriteLine(e.Body);                          // (x > 5)
Console.WriteLine(e.Body.NodeType);                 // GreaterThan
var gt = (BinaryExpression)e.Body;
Console.WriteLine(gt.Left);                         // x  (ParameterExpression)
Console.WriteLine(gt.Right);                        // 5  (ConstantExpression)

Func<int, bool> compiled = e.Compile();             // перетворити дані назад на код
Console.WriteLine(compiled(7));                     // True
```

Деревом можуть стати лише **лямбди-вирази**: без тіла з інструкціями, без присвоєнь, без `async`.

## Типи вузлів

Усі вузли походять від `System.Linq.Expressions.Expression`:

| Вузол | Подає |
| --- | --- |
| `ParameterExpression` | параметр лямбди |
| `ConstantExpression` | літеральне значення |
| `MemberExpression` | доступ до властивості чи поля (`c.Name`); тут з'являються й захоплені змінні |
| `MethodCallExpression` | виклик методу (`c.Name.StartsWith("A")`) |
| `BinaryExpression` | `==`, `>`, `&&`, `+`, ... |
| `UnaryExpression` | `!`, заперечення, перетворення |
| `LambdaExpression` | саму лямбду: параметри + тіло |
| `NewExpression`, `MemberInitExpression` | `new { ... }`, ініціалізатори об'єктів |

## Побудова дерев вручну

Статичні фабричні методи `Expression` дозволяють будувати запити динамічно — це основа узагальнених фільтрів, API «сортувати за колонкою» та патерну Specification:

```csharp
// будує: c => c.<propertyName> == value
static Expression<Func<T, bool>> PropertyEquals<T>(string propertyName, object value)
{
    ParameterExpression c = Expression.Parameter(typeof(T), "c");
    MemberExpression prop = Expression.Property(c, propertyName);
    ConstantExpression constant = Expression.Constant(value, prop.Type);
    BinaryExpression body = Expression.Equal(prop, constant);
    return Expression.Lambda<Func<T, bool>>(body, c);
}

var filter = PropertyEquals<Customer>("Country", "UA");
var result = db.Customers.Where(filter);   // EF Core перекладає це так само, як написану вручну лямбду
```

## Поєднання предикатів

Два значення `Expression<Func<T,bool>>` не можна просто з'єднати через `&&`; треба поєднати їхні тіла над **спільним параметром**. Простий підхід використовує `Expression.Invoke` (деякі провайдери його не підтримують); надійний — переписує параметр другого тіла через `ExpressionVisitor`:

```csharp
class ReplaceParameter : ExpressionVisitor
{
    private readonly ParameterExpression _from, _to;
    public ReplaceParameter(ParameterExpression from, ParameterExpression to) { _from = from; _to = to; }
    protected override Expression VisitParameter(ParameterExpression node) => node == _from ? _to : node;
}

static Expression<Func<T, bool>> And<T>(Expression<Func<T, bool>> a, Expression<Func<T, bool>> b)
{
    var body = new ReplaceParameter(b.Parameters[0], a.Parameters[0]).Visit(b.Body);
    return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(a.Body, body), a.Parameters);
}
```

`ExpressionVisitor` — це ще й те, як провайдери обходять дерево, щоб його перекласти.

## Компіляція виразів заради швидкості

`Expression.Compile()` генерує справжній IL під час виконання. Побудуйте вираз один раз, скомпілюйте, закешуйте делегат — і отримаєте майже нативну швидкість для динамічного коду: швидкі гетери властивостей, мапери (так робить AutoMapper), серіалізатори. Компіляція повільна (мілісекунди), тож завжди кешуйте.

## Що сказати на співбесіді

- `Expression<Func<...>>` — дерево, що описує код; `Func<...>` — скомпільований код.
- Провайдери на кшталт EF Core перекладають дерева; `Compile()` перетворює їх на делегати.
- Для динамічних фільтрів будуйте дерева через `Expression.Parameter/Property/Equal/Lambda`; переписуйте їх через `ExpressionVisitor`.
