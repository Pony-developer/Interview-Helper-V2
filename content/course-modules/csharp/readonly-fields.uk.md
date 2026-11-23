Деякі об'єкти **ніколи не мають змінюватися** після створення: дата, точка, дріб, ціна. Ключове слово **`readonly`** на полі каже саме це: йому можна присвоїти значення **один раз** — в оголошенні або в конструкторі, і більше ніколи.

```csharp
class Fraction
{
    private readonly int numerator;                    // поля readonly
    private readonly int denominator;

    public Fraction(int numerator, int denominator)
    {
        this.numerator = numerator;                    // дозволено: усередині конструктора
        this.denominator = denominator;
    }

    public int Numerator => numerator;
    public int Denominator => denominator;

    public void Reduce()
    {
        // numerator = 1;                              // помилка CS0191: полю readonly не можна присвоювати
    }
}
```

Компілятор це **примушує**. Коротший спосіб отримати той самий ефект — автовластивість лише для читання, яка має приховане поле readonly:

```csharp
public int Numerator { get; }                          // присвоюється лише в конструкторі
```

## Незмінні об'єкти

Клас, де **усі** поля `readonly` і жоден метод їх не змінює, дає **незмінні** об'єкти. Операції повертають **нові** об'єкти:

```csharp
class Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }

    public Money Plus(Money other)                       // новий об'єкт, а не зміна
    {
        if (other.Currency != Currency) throw new ArgumentException("Different currencies");
        return new Money(Amount + other.Amount, Currency);
    }

    public Money WithAmount(decimal amount) { return new Money(amount, Currency); }
}
```

`string`, `DateTime` і числа працюють саме так: `s.ToUpper()` не змінює `s`, а дає новий рядок.

Чим це добре?

- **Інваріанти перевіряють один раз**, у конструкторі, і пізніше їх не можна порушити. Немає «set», який треба охороняти.
- Це **безпечно ділити**: якщо десять частин програми тримають той самий `Money`, ніхто не може змінити його для інших.
- Про це легко **міркувати**: об'єкт однаковий у кожну мить свого життя, тож питань «хто це змінив?» немає.
- Безпечно вживати як **ключ** словника, бо дані, від яких залежить хеш, ніколи не змінюються.
- Безпечно в **кількох потоках**.

Ціна — новий об'єкт для кожної зміни, що дешево для малих об'єктів.

## `readonly` поверхневий

`readonly` захищає **змінну**, а не **об'єкт**, на який вона вказує:

```csharp
class Team
{
    private readonly List<string> members = new List<string>();   // змінна зафіксована...

    public void Add(string name) { members.Add(name); }           // ...а список — ні
}
```

Знову написати `members = new List<string>()` не можна, але вміст списку змінювати все одно можна. Для справді незмінного класу **не віддавайте внутрішню колекцію** і тримайте копію:

```csharp
public string[] Members => members.ToArray();      // копія: зовнішній код не може змінити список
```

`ToArray` — метод `List<T>`. Повернення самого списку (`return members;`) зламало б інкапсуляцію, бо той, хто викликає, міг би додавати й видаляти елементи без жодних перевірок.

## `readonly` і `const`

- **`const`**: значення, відоме під час **компіляції**, однакове для всіх (`const int DaysInWeek = 7;`). Лише числа, рядки й подібне.
- **`readonly`**: значення, яке задається під час **виконання**, у конструкторі, і може бути різним для кожного об'єкта (об'єкт будь-якого типу).

## Коли не робити клас незмінним

Коли об'єкт великий і часто змінюється (велике ігрове поле, буфер), копіювання при кожній зміні марнотратне. Тоді вживайте змінний клас, але зробіть так, щоб **усі зміни йшли через методи**, що зберігають інваріанти.
