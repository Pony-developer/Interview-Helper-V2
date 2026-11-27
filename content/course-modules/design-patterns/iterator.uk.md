**Простими словами:** Iterator дає змогу **обходити колекцію по одному елементу**, не знаючи, як вона влаштована всередині: масив, список, дерево чи база даних сторінка за сторінкою.

## Картинка з життя

Кнопка «наступний канал» на пульті. Не треба знати, як канали зберігаються в пам'яті телевізора; ви просто тиснете «далі», поки не знайдете щось цікаве.

## На C#: вбудовано в мову

`IEnumerable<T>` — це «щось, що можна обійти»; `IEnumerator<T>` — «палець», що вказує на поточний елемент (`MoveNext()`, `Current`). `foreach` користується ними за вас.

А `yield return` пише весь ітератор за вас:

```csharp
// Обхід дерева бізнес-підрозділів так, що код, який викликає, не знає, що це дерево
static IEnumerable<BusinessUnit> AllUnits(BusinessUnit root)
{
    yield return root;
    foreach (var child in root.Children)
        foreach (var unit in AllUnits(child))
            yield return unit;
}

foreach (var unit in AllUnits(company))
    Console.WriteLine(unit.Name);
```

## Реальний приклад: сторінки

Dataverse повертає щонайбільше 5 000 записів за запит. Ітератор може сховати посторінкове читання:

```csharp
static IEnumerable<Entity> AllRecords(IOrganizationService service, QueryExpression query)
{
    query.PageInfo = new PagingInfo { PageNumber = 1, Count = 5000 };
    while (true)
    {
        var page = service.RetrieveMultiple(query);
        foreach (var record in page.Entities) yield return record;
        if (!page.MoreRecords) yield break;
        query.PageInfo.PageNumber++;
        query.PageInfo.PagingCookie = page.PagingCookie;
    }
}
```

Код, що викликає, просто пише `foreach (var account in AllRecords(service, query))`.

## Що варто знати

- **Лінивість:** код після `yield return` виконується, лише коли попросять наступний елемент. На цьому побудовано LINQ (відкладене виконання).
- **Не змінюйте** `List<T>`, поки обходите його `foreach`: отримаєте `InvalidOperationException`.
- Повторний обхід `IEnumerable` може вдруге виконати запит. Викличте `.ToList()`, якщо результати потрібні більше одного разу.

## Запам'ятайте

Iterator = «**дай наступний**», приховуючи, як зберігаються елементи. У C#: `IEnumerable<T>`, `foreach`, `yield return`.
