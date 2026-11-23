`async` позначає метод, який може призупинитися на `await` і продовжитися пізніше. `await` чекає на задачу **без блокування потоку**: метод повертається до викликаючого, а коли задачу завершено, решта методу виконується знову.

```csharp
static async Task<int> ComputeAsync()
{
    Console.WriteLine("start");
    await Task.Delay(200);                    // призупиняється тут; потік тим часом вільний
    Console.WriteLine("after the delay");
    return 42;                                // Task<int> завершиться зі значенням 42
}

Task<int> work = ComputeAsync();
Console.WriteLine("the caller continues");
Console.WriteLine(work.Result);               // чекає на результат
// start, the caller continues, after the delay, 42
```

## Типи

- `async Task<T>` повертає значення; `await` дає значення: `int x = await ComputeAsync();`.
- `async Task` нічого не повертає; `await` лише чекає.
- `async void` — лише для обробників подій (див. лекцію про пастки).

## Послідовно і одночасно

Два `await` підряд виконуються один за одним. Щоб виконати їх разом, спершу запустіть обидві задачі, а очікуйте їх потім:

```csharp
int a = await ComputeAsync();                 // займає 200 мс
int b = await ComputeAsync();                 // ще 200 мс: разом 400 мс

Task<int> t1 = ComputeAsync();                // обидві стартують зараз
Task<int> t2 = ComputeAsync();
int c = await t1;                             // разом близько 200 мс
int d = await t2;
```

## Що робить компілятор

Компілятор перетворює `async`-метод на машину станів: клас, що пам'ятає, де метод зупинився, і що містять його локальні змінні. Тому `await` не потребує потоку, щоб чекати. Механізм схожий на ітератори з модуля про `yield return`.

## Практичні правила

- Ставте `async` на метод, що використовує `await`.
- Повертайте з `async`-методів `Task` або `Task<T>`, щоб викликаючі могли їх чекати.
- Всередині `async`-коду використовуйте `Task.Delay`, а не `Thread.Sleep`.
