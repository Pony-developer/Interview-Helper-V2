Ви багато разів використовували `foreach`. Він працює з масивами, списками, рядками й словниками. Як один цикл працює з такими різними типами? Відповідь — пара інтерфейсів: `IEnumerable` і `IEnumerator`.

`foreach` просить колекцію дати **перелічувач** (enumerator), а потім крок за кроком переміщає його:

```csharp
int[] numbers = { 10, 20, 30 };

foreach (int n in numbers)
{
    Console.WriteLine(n);
}

// Компілятор перетворює цикл приблизно на це:
IEnumerator<int> e = numbers.GetEnumerator();
while (e.MoveNext())
{
    int n = e.Current;
    Console.WriteLine(n);
}
```

## Два інтерфейси

- **`IEnumerable<T>`** має один метод, `GetEnumerator()`, що повертає перелічувач. Це означає «мене можна обійти».
- **`IEnumerator<T>`** — той, хто обходить. Його `MoveNext()` переходить до наступного елемента й повертає `true`, якщо елемент є. Властивість `Current` — елемент, на якому він стоїть. До першого `MoveNext()` значення `Current` не дійсне.

```csharp
var list = new List<string> { "a", "b" };
IEnumerator<string> it = list.GetEnumerator();
Console.WriteLine(it.MoveNext());   // True
Console.WriteLine(it.Current);      // a
Console.WriteLine(it.MoveNext());   // True
Console.WriteLine(it.Current);      // b
Console.WriteLine(it.MoveNext());   // False: елементів більше немає
```

## Чому foreach потребує лише це

`foreach` не знає, що саме є колекцією. Йому потрібен лише `GetEnumerator`. Тож будь-який тип, що його надає, можна використати в `foreach`, зокрема ваші власні класи. Ось справжній зміст слова «колекція»: **щось, що може дати перелічувач**.

`IEnumerator<T>` також є `IDisposable`. Цикл `foreach` звільняє перелічувач, коли завершується, навіть якщо ви вийшли раніше через `break`. Це важливо для перелічувачів, що тримають файл чи з'єднання.

## Негенеричні версії

`IEnumerable` і `IEnumerator` без `<T>` — старі версії, з часів до дженериків. Вони повертають `object` замість `T`. Новий код використовує узагальнені версії.

Наступна лекція показує, як написати перелічувач самому.
