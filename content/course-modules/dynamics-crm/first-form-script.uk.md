Напишімо, завантажмо й перевірмо справжній скрипт форми. Мета: на формі акаунта, коли **Credit Limit** більший за 100 000, робити **Payment Terms** обов'язковим і показувати сповіщення; інакше знову робити його необов'язковим.

## 1. Напишіть скрипт

Створіть файл `contoso_account.js`:

```javascript
var Contoso = Contoso || {};

Contoso.Account = {
    onLoad: function (executionContext) {
        Contoso.Account.applyCreditRules(executionContext.getFormContext());
    },

    onCreditLimitChange: function (executionContext) {
        Contoso.Account.applyCreditRules(executionContext.getFormContext());
    },

    applyCreditRules: function (formContext) {
        const credit = formContext.getAttribute("creditlimit").getValue();   // число або null
        const terms = formContext.getAttribute("paymenttermscode");

        if (credit !== null && credit > 100000) {
            terms.setRequiredLevel("required");
            formContext.ui.setFormNotification("High credit limit: payment terms are required.", "WARNING", "credit");
        } else {
            terms.setRequiredLevel("none");
            formContext.ui.clearFormNotification("credit");
        }
    },
};
```

Зверніть увагу: логіка живе в одній функції `applyCreditRules`, яку викликають і при завантаженні (для наявних записів), і при зміні (поки користувач редагує). Сповіщення має id `"credit"`, тож його можна потім прибрати.

## 2. Завантажте його як веб-ресурс

1. У рішенні: **New** → **More** → **Web resource**.
2. Завантажте файл, відображуване ім'я «Account form script», ім'я `contoso_/scripts/account.js`, тип **JavaScript (JS)**.
3. **Save** і **Publish**.

## 3. Підключіть до форми

1. Відкрийте форму **Main** акаунта в дизайнері форм.
2. У **Form libraries** додайте `contoso_/scripts/account.js`.
3. Виберіть форму, перейдіть у **Events** → **On Load** → **+ Event handler**: бібліотека `contoso_/scripts/account.js`, функція `Contoso.Account.onLoad`, увімкніть **Pass execution context as first parameter**.
4. Виберіть стовпець **Credit Limit**, **Events** → **On Change**: функція `Contoso.Account.onCreditLimitChange`, теж із контекстом виконання.
5. **Save and publish**.

## 4. Перевірте

Відкрийте акаунт, введіть 150 000 у Credit Limit і вийдіть із поля: з'являється попередження, а Payment Terms отримує червону зірочку. Поставте 50 000: обидва зникають. Спробуйте зберегти зі 150 000 без умов оплати: форма не дасть.

Якщо нічого не відбувається, натисніть **F12**, подивіться помилки в **Console** і перевірте, що імена функцій в обробниках збігаються точно, з урахуванням регістру.

## 5. Пам'ятайте про сервер

Це правило живе лише у формі. Імпорт з Excel чи інтеграція все одно можуть зберегти акаунт із високим кредитним лімітом без умов оплати. Якщо правило має діяти завжди, додайте ту саму перевірку в синхронний плагін або зробіть бізнес-правило з областю *Entity*.

## Ідеї для наступної практики

- Ховайте всю секцію **Payment Terms** для акаунтів типу *Competitor* (`formContext.ui.tabs.get(…).sections.get(…).setVisible(false)`).
- Показуйте, скільки символів лишилося в полі опису, при кожній зміні.
- Задавайте **Credit Limit** = 0 за замовчуванням для нового акаунта (`formContext.ui.getFormType() === 1` означає Create).
