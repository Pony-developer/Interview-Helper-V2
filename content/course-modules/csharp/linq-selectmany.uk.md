`Select` дає один результат для кожного вхідного елемента. Але що, якщо кожен елемент містить **кілька** результатів, наприклад список списків? `SelectMany` дає всі результати однією плоскою послідовністю.

```csharp
var sentences = new[] { "the cat", "a big dog" };

var words = sentences.Select(s => s.Split(' '));          // всередині 2 масиви: { {the,cat}, {a,big,dog} }
var allWords = sentences.SelectMany(s => s.Split(' '));   // одна плоска послідовність: the, cat, a, big, dog
```

`Select` зберігає вкладеність: результат — послідовність послідовностей. `SelectMany` знімає один рівень: лямбда повертає послідовність для кожного елемента, і всі послідовності з'єднуються одна за одною.

## Поширений шаблон

Візьміть кожен елемент кожної групи:

```csharp
var orders = new[]
{
    new { Customer = "Ann", Items = new[] { "pen", "ink" } },
    new { Customer = "Bob", Items = new[] { "pad" } }
};

var lines = orders.SelectMany(o => o.Items.Select(item => o.Customer + " bought " + item));
// Ann bought pen, Ann bought ink, Bob bought pad
```

Внутрішній `Select` будує рядки для одного замовлення, а зовнішній `SelectMany` з'єднує їх усі.

## Форма з індексом

`SelectMany` має також перевантаження з індексом елемента, як і `Select`:

```csharp
var numbered = sentences.SelectMany((s, i) => s.Split(' ').Select(w => i + ":" + w));
```

## Коли використовувати

Щоразу, коли потрібна відповідь на питання «для кожного елемента дай кілька речей»: усі слова всіх рядків, усі теги всіх дописів, усі рядки всіх таблиць. Якщо ви пишете два вкладені цикли `foreach`, що будують список, зазвичай їх замінює `SelectMany`.
