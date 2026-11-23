Тип-значення, як `int`, не може бути `null`: кожна змінна `int` завжди тримає число. Але іноді значення **відсутнє**: вік людини може бути невідомим, пошук може нічого не знайти. Для цього в C# є `Nullable<T>`, який записують зі знаком питання: `int?`.

```csharp
int? age = null;                 // вік поки невідомий
age = 30;                        // тепер є значення

if (age.HasValue)
{
    Console.WriteLine(age.Value + 1);    // 31
}
```

`int?` — те саме, що `Nullable<int>`. Це **структура**, що тримає прапорець (`HasValue`) і значення (`Value`). Читання `Value`, коли значення немає, кидає `InvalidOperationException`, тож спершу перевіряйте `HasValue`.

## Корисні оператори

```csharp
int? a = null;
int? b = 7;

int x = a ?? 0;                  // оператор «null-coalescing»: 0, бо a дорівнює null
int y = b ?? 0;                  // 7
int z = a.GetValueOrDefault(5);  // 5: значення або 5, якщо його немає

int? sum = a + b;                // null: будь-яка операція з null дає null
Console.WriteLine(sum == null);  // True
```

- `??` дає ліву частину, якщо вона не `null`, інакше праву.
- Арифметика з `null` дає `null`, а не помилку.
- `GetValueOrDefault(d)` дає значення або `d`, якщо його немає.

## Звідки це береться

Пошук, який може нічого не знайти, — природний випадок:

```csharp
static int? FindIndex(int[] items, int target)
{
    for (int i = 0; i < items.Length; i++)
    {
        if (items[i] == target)
        {
            return i;                    // int автоматично перетворюється на int?
        }
    }
    return null;                         // не знайдено
}

int? pos = FindIndex(new[] { 4, 8, 15 }, 8);
Console.WriteLine(pos.HasValue ? pos.Value.ToString() : "not found");   // 1
```

Це зрозуміліше, ніж повертати `-1`, бо `-1` можна сплутати з реальним індексом, а `null` — ні.

## Посилальні типи вже мають null

`string` і класи можуть бути `null` без `?`. Знак `?` потрібен лише для типів-значень. У C# 8 і пізніших версіях посилальні типи теж отримали перевірки null, але це окрема можливість.
