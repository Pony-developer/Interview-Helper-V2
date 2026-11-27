Скрипти форм — це невеликі файли JavaScript, що роблять model-driven форми розумнішими: показують поле лише тоді, коли воно потрібне, перевіряють значення під час введення, заповнюють типові значення. Для них потрібна лише частина JavaScript. Ця сторінка про цю частину.

## Змінні та значення

```javascript
const discount = 0.15;          // ніколи не перепризначається
let label = "Normal";           // може змінюватися
label = "High";
```

За замовчуванням використовуйте `const`, а `let` — коли значення змінюється. Уникайте `var`: він ігнорує блокову область видимості й спричиняє сюрпризи.

Значення, які ви зустрінете: рядки (`"Contoso"`), числа (`42`, `0.15`), булеві (`true`), `null` (порожнє поле), `undefined` (те, що ніколи не задавали), масиви (`[1, 2, 3]`) та об'єкти (`{ id: "…", name: "Contoso" }`).

## Порівняння

Завжди використовуйте `===` і `!==`. Старіший `==` перетворює типи (`"2" == 2` дає `true`), що ховає помилки.

```javascript
if (priority === 2) { … }                 // значення choice — це число
if (name !== null && name.length > 0) { … }
const title = name ?? "(no name)";        // значення за замовчуванням, коли null чи undefined
const city = account?.address?.city;      // зупинитися на null без помилки
```

## Функції

```javascript
function onLoad(executionContext) {
    const formContext = executionContext.getFormContext();
    // …
}

const isBig = (amount) => amount > 100000;   // стрілкова функція
```

Платформа викликає **вашу** функцію, коли відбувається подія форми (OnLoad, OnSave, OnChange стовпця), і передає першим параметром **контекст виконання**, якщо ввімкнути *Pass execution context as first parameter*. З нього ви отримуєте **контекст форми** — об'єкт для всього, що на формі.

## Простори імен

На одній формі можуть жити багато скриптів від різних команд. Якщо два з них визначають глобальну `onLoad`, перемагає той, що завантажився останнім. Покладіть свої функції в один об'єкт, названий на честь компанії й таблиці:

```javascript
var Contoso = Contoso || {};
Contoso.Account = {
    onLoad: function (executionContext) { … },
    onCreditLimitChange: function (executionContext) { … },
};
```

На формі ви реєструєте обробником `Contoso.Account.onLoad`.

## Очікування сервера: Promise

Виклики Dataverse зі скрипта, як-от `Xrm.WebApi.retrieveRecord`, тривають певний час і повертають **Promise**: значення, що прийде пізніше. Чекайте на нього через `async` і `await`, а помилки ловіть через `try`/`catch`:

```javascript
async function showParentPhone(executionContext) {
    const formContext = executionContext.getFormContext();
    const parent = formContext.getAttribute("parentcustomerid").getValue();
    if (!parent) return;

    try {
        const account = await Xrm.WebApi.retrieveRecord("account", parent[0].id, "?$select=telephone1");
        formContext.ui.setFormNotification("Company phone: " + account.telephone1, "INFO", "phone");
    } catch (error) {
        console.error(error.message);
    }
}
```

## Налагодження в браузері

Натисніть **F12**, щоб відкрити інструменти розробника. **Console** показує виведення `console.log` і помилки; на вкладці **Sources** можна знайти ваш веб-ресурс (пошук за назвою) і поставити точки зупину; вкладка **Network** показує кожен виклик до `/api/data/`. Рядок `debugger;` у коді зупиняє виконання там, коли інструменти відкрито.

## TypeScript

Більшість команд пишуть скрипти форм на **TypeScript** і компілюють їх у JavaScript. З пакетом `@types/xrm` редактор знає кожен метод `formContext` і ловить одруківки на кшталт `getAtribute` ще до розгортання. Усе на цій сторінці — теж коректний TypeScript.
