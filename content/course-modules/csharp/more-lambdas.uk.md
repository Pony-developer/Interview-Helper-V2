Лямбди найкорисніші, коли їх передають у методи колекцій. Ось поширені шаблони:

```csharp
var people = new List<string> { "Ann", "Bob", "Cy", "Dan" };

string firstShort = people.Find(p => p.Length <= 2);   // "Cy"
List<string> withA = people.FindAll(p => p.Contains("a"));   // "Dan" (у Ann велика A)
bool anyLong = people.Exists(p => p.Length > 5);       // False
people.Sort((x, y) => y.Length.CompareTo(x.Length));   // найдовші першими
people.ForEach(p => Console.WriteLine(p));              // друкує кожне ім'я
```

## Перетворення списку

`ConvertAll` будує новий список, застосовуючи лямбду до кожного елемента:

```csharp
var numbers = new List<int> { 1, 2, 3 };
List<string> labels = numbers.ConvertAll(n => "item " + n);   // "item 1", "item 2", "item 3"
```

## Лямбди, що захоплюють значення

Лямбда може використовувати змінну ззовні, якщо вона в області видимості:

```csharp
int limit = 10;
List<int> small = numbers.FindAll(n => n < limit);
```

Лямбда читає `limit` у момент виконання. Лекція про замикання пояснює це докладно.

## Метод, що повертає лямбду

Метод може повертати делегат, і лямбда — звичайне значення для повернення:

```csharp
static Func<int, int> Multiplier(int factor)
{
    return x => x * factor;             // повернена лямбда запам'ятовує factor
}

Func<int, int> triple = Multiplier(3);
Console.WriteLine(triple(7));           // 21
```

Це найважливіше застосування лямбд: писати поведінку, зібрану з даних під час виконання.
