Двічі писати тип швидко набридає: `Dictionary<string, int> ages = new Dictionary<string, int>();`. З `var` ви доручаєте компілятору визначити тип за значенням праворуч:

```csharp
var count = 4;          // int
var price = 12.5;       // double
var name = "Ann";       // string
var isReady = true;     // bool
var big = 5L;           // long
var money = 9.99m;      // decimal
```

## var — це все ще статична типізація

`var` — **не** «змінна довільного типу» і не визначається під час виконання. Компілятор обирає тип один раз, під час компіляції, і далі змінна поводиться так само, ніби ви самі записали тип. Перевірити, що він обрав, можна так:

```csharp
var x = 7;
var y = 7.0;
Console.WriteLine(x.GetType());   // System.Int32
Console.WriteLine(y.GetType());   // System.Double
```

Тип береться з **усієї** правої частини: `var share = 7 / 2;` — це `int` зі значенням `3`, а `var average = 7 / 2.0;` — це `double` зі значенням `3.5`.

## Правила

1. Змінну треба **ініціалізувати** в тій самій інструкції, інакше нема з чого виводити тип:

   ```csharp
   var a;          // помилка CS0818: Implicitly-typed variables must be initialized
   ```

2. Значення не може бути голим `null`, бо в `null` немає типу:

   ```csharp
   var b = null;   // помилка CS0815: Cannot assign <null> to an implicitly-typed variable
   ```

3. Тип надалі не змінюється:

   ```csharp
   var c = 5;
   c = "five";     // помилка CS0029: Cannot implicitly convert type 'string' to 'int'
   ```

4. `var` працює лише для **локальних змінних**. Параметри методів, типи значень, що повертаються, та поля досі потребують явного типу.

## Коли його використовувати

Беріть `var`, коли тип очевидний із правої частини або коли він довгий і заважає читати:

```csharp
var cities = new List<string>();   // тип записано тут же
var total = 0;                     // очевидно, що це int
```

Записуйте тип явно, коли права частина його не розкриває або коли вам потрібен інший тип, ніж типовий:

```csharp
var result = Calculate();    // що повертає Calculate? Важко сказати
double ratio = 1;            // var дав би тут int, а вам потрібен double
long big = 5;                // var дав би int
```

Обидва стилі компілюються в однаковий код, тож усе зводиться до читабельності. Обирайте той, що полегшить життя наступному читачеві.
