Інтеграція, що ігнорує ліміти захисту сервісу, чудово працює на тестах і падає на першому великому імпорті. Напишіть логіку повторів, яка втримає її на ногах.

У програмі є `IHttpSender`, що відповідає заздалегідь заданими відповідями, `IClock`, чий `Sleep` лише записує очікування (тож програма виконується миттєво), і `HttpResponse` зі `Status` та необов'язковим `RetryAfter` у секундах. Реалізуйте `ResilientClient.Send(request)`:

- Надішліть запит через `sender.Send(request)`.
- Якщо статус **429** (Too Many Requests) або **503** (Service Unavailable), збій тимчасовий: зачекайте й надішліть знову.
  - Чекайте `RetryAfter` секунд, якщо відповідь його містить.
  - Інакше відступайте експоненційно: `2^n` секунд, де `n` — кількість уже зроблених повторів: 1 с перед першим повтором, 2 с перед другим, 4 с перед третім.
  - Чекайте через `clock.Sleep(TimeSpan.FromSeconds(seconds))`.
- Повторюйте щонайбільше `maxRetries` разів. Коли повтори вичерпано, поверніть останню відповідь.
- Будь-який інший статус (204, 400…) повертайте одразу, без повторів.

Не змінюйте `Main`. Очікуваний результат:

```text
== Plain success
  PATCH accounts(1) -> 204
  result 204, waited 0s
== Throttled with Retry-After
  PATCH accounts(1) -> 429 (Retry-After: 5)
  wait 5s
  PATCH accounts(1) -> 429 (Retry-After: 3)
  wait 3s
  PATCH accounts(1) -> 204
  result 204, waited 8s
== Unavailable without Retry-After
  PATCH accounts(1) -> 503
  wait 1s
  PATCH accounts(1) -> 503
  wait 2s
  PATCH accounts(1) -> 503
  wait 4s
  PATCH accounts(1) -> 204
  result 204, waited 7s
== Gives up
  PATCH accounts(1) -> 429 (Retry-After: 10)
  wait 10s
  PATCH accounts(1) -> 429 (Retry-After: 10)
  wait 10s
  PATCH accounts(1) -> 429 (Retry-After: 10)
  result 429, waited 20s
== Mixed
  PATCH accounts(1) -> 503
  wait 1s
  PATCH accounts(1) -> 429 (Retry-After: 7)
  wait 7s
  PATCH accounts(1) -> 503
  wait 4s
  PATCH accounts(1) -> 204
  result 204, waited 12s
== Bad request is not retried
  PATCH accounts(1) -> 400
  result 400, waited 0s
```

У «Gives up» `maxRetries` дорівнює 2: перше надсилання плюс два повтори, а третя 429 повертається без нового очікування. У «Mixed» третє очікування — 4 с, бо вже зроблено два повтори, хоча один із них використав `Retry-After`.

Підказка: найкоротша форма — цикл `for (int retry = 0; ; retry++)`, з якого повертаються зсередини. `response.RetryAfter ?? (int)Math.Pow(2, retry)` обирає тривалість очікування.
