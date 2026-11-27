## Record одним рядком

```csharp
public record Product(string Sku, string Name, decimal Price);
```

Цей один рядок оголошує клас з:

- конструктором, що приймає `Sku`, `Name`, `Price`;
- публічними властивостями з `init` з цими назвами (незмінні після створення);
- **рівністю за значенням**: два продукти з однаковими Sku, Name і Price рівні (`Equals`, `==`, `GetHashCode`);
- зручним `ToString()`: `Product { Sku = A1, Name = Pen, Price = 1.5 }`;
- методом `Deconstruct`: `var (sku, name, price) = product;`;
- підтримкою **неруйнівної зміни** через `with`.

## Вирази with

```csharp
var pen = new Product("A1", "Pen", 1.50m);
var discounted = pen with { Price = 1.20m };   // копія зі зміненою властивістю

Console.WriteLine(pen.Price);         // 1.50: оригінал не змінився
Console.WriteLine(pen == discounted); // False
```

`with` викликає прихований конструктор копіювання (метод «clone»), а потім задає перелічені властивості. Це **поверхнева** копія: якщо record містить `List<T>`, обидві копії мають спільний список.

## Номінальні record

Позиційна форма не обов'язкова:

```csharp
public record Customer
{
    public required string Email { get; init; }    // 'required' — це C# 11; у C# 10 беріть конструктор
    public string? Phone { get; init; }
    public List<string> Tags { get; init; } = new();
}
```

Можна поєднувати: позиційні параметри плюс додаткові властивості й методи в тілі.

```csharp
public record Order(int Id, DateTime Placed)
{
    public decimal Total { get; init; }
    public bool IsLarge => Total > 1000;
}
```

## record class проти record struct (C# 10)

| | `record` / `record class` | `record struct` | `readonly record struct` |
| --- | --- | --- | --- |
| Вид | тип посилання | тип значення | тип значення |
| Позиційні властивості | `init` (незмінні) | `get; set;` (**змінні**) | `init` (незмінні) |
| Успадкування | так, record від record | ні | ні |
| `null` | можливий | ні | ні |

`readonly record struct` — для невеликих даних-значень (координати, гроші); `record class` — для більших сутностей і DTO.

## Успадкування

```csharp
public record Person(string Name);
public record Employee(string Name, string Department) : Person(Name);

Person p = new Employee("Ann", "IT");
Console.WriteLine(p);   // Employee { Name = Ann, Department = IT }: ToString віртуальний
```

Record може успадковувати лише інший record (або `object`), а клас не може успадковувати record.

## Коли record доречні

- DTO та контракти API, повідомлення й події: дані, які створюють, передають і порівнюють.
- Об'єкти-значення в domain-driven design (`Money`, `Address`, `DateRange`).
- Ключі в словниках і множинах завдяки рівності за значенням.

Коли ні: сутності, чия ідентичність важливіша за значення (два рядки `Customer` з однаковими даними — все одно два клієнти), або об'єкти зі змінним станом та інкапсульованою поведінкою. Також рівність за значенням на сутностях EF Core спричиняє тонкі помилки відстеження.

## Що сказати на співбесіді

- `record` = клас + рівність за значенням + `ToString` + деконструкція + `with`.
- `with` робить поверхневу копію; оригінал не змінюється.
- `record struct` — тип значення, змінний, якщо не `readonly`.
