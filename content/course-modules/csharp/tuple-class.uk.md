**Кортеж** — це малий узагальнений клас, що тримає фіксовану кількість значень, можливо, різних типів. Такий клас корисний, і в .NET він уже є: `System.Tuple<T1, T2>`.

```csharp
var pair = Tuple.Create("Ann", 30);
Console.WriteLine(pair.Item1);          // Ann
Console.WriteLine(pair.Item2 + 1);      // 31
```

Властивості називаються `Item1`, `Item2` і так далі. Вони не кажуть, що означають значення, і це загальна слабкість кортежів. Порівняйте з класом, що має іменовані поля.

## Написання власної пари

Та сама ідея, записана як узагальнений клас з двома параметрами типу:

```csharp
class Pair<TFirst, TSecond>
{
    public TFirst First { get; }
    public TSecond Second { get; }

    public Pair(TFirst first, TSecond second)
    {
        First = first;
        Second = second;
    }

    public override string ToString()
    {
        return "(" + First + ", " + Second + ")";
    }
}

var p = new Pair<string, int>("Ann", 30);
Console.WriteLine(p);                   // (Ann, 30)
```

Кожен параметр типу може бути різним: `Pair<int, int>`, `Pair<string, bool>` тощо, а компілятор перевіряє типи `First` і `Second`.

## Де пара корисна

- результат, схожий на словник, наприклад ключ і його значення (стандартний `KeyValuePair<TKey, TValue>` — саме ця ідея);
- метод, що має на короткий час повернути два пов'язані значення, наприклад позицію мінімуму і саме значення;
- елементи списку, коли для одного малого використання цілий клас був би завеликим.

Якщо пару використовують у багатьох місцях зі змістом, дайте їй назву: `Score`, `Point`, `Range`.
