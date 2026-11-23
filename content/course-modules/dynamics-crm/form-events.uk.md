Скрипти запускаються, бо щось сталося. Правильний вибір події та знання її порядку й обмежень вирішують, чи скрипт працюватиме миттєво, чи заважатиме.

## Основні події

| Подія | Де реєструється | Коли |
| --- | --- | --- |
| **OnLoad** | Форма | Форма відкривається, і знову після збереження, що перезавантажує дані |
| **OnChange** | Стовпець | Користувач змінює значення й виходить із поля (або скрипт викликає `fireOnChange`) |
| **OnSave** | Форма | Перед збереженням запису (користувачем, автозбереженням чи скриптом) |
| **OnPostSave** | Форма (`formContext.data.entity.addOnPostSave`) | Після завершення збереження, вдалого чи ні |
| **TabStateChange** | Вкладка | Вкладку розгорнули чи згорнули |
| **PreSearch** | Контрол lookup | Безпосередньо перед пошуком у lookup |
| **OnLoad** | Підсітка | Підсітка завершила завантаження |
| **OnDataLoad** | Форма (`formContext.data.addOnLoad`) | Дані (пере)завантажено, зокрема після `data.refresh()` |

Реєструйте обробники в дизайнері форм або в коді з OnLoad через `addOnChange`, `addOnSave`, `addOnPostSave`, `addPreSearch`; реєстрація в коді тримає зв'язки в системі контролю версій.

## OnSave

```javascript
function onSave(executionContext) {
  const args = executionContext.getEventArgs();
  const fc = executionContext.getFormContext();
  const mode = args.getSaveMode();   // 1 Save, 2 Save and Close, 59 Save and New, 70 AutoSave

  if (mode === 70) return;           // не набридати під час автозбереження
  const email = fc.getAttribute("emailaddress1").getValue();
  if (email && !email.endsWith("@contoso.com")) {
    args.preventDefault();
    fc.ui.setFormNotification("Use a company email address.", "ERROR", "email");
  }
}
```

`preventDefault()` скасовує збереження; `isDefaultPrevented()` повідомляє наступним обробникам, що його скасовано. Автозбереження типово спрацьовує кожні 30 секунд, коли запис змінено: обробник, що показує діалоги під час кожного збереження, робить форму непридатною.

## Асинхронні OnLoad і OnSave

Обробники можуть повертати **проміс**, і платформа чекає на нього (до приблизно 10 секунд), коли в застосунку ввімкнено налаштування *async onload/onsave handler*:

```javascript
async function onSave(executionContext) {
  const fc = executionContext.getFormContext();
  const accountId = fc.getAttribute("parentcustomerid").getValue()?.[0]?.id;
  if (!accountId) return;
  const account = await Xrm.WebApi.retrieveRecord("account", accountId, "?$select=creditonhold");
  if (account.creditonhold) {
    executionContext.getEventArgs().preventDefault();
    fc.ui.setFormNotification("The account is on credit hold.", "ERROR", "hold");
  }
}
```

Без підтримки асинхронності проміс ігнорується, і збереження відбувається раніше, ніж завершиться ваша перевірка; це класична помилка «перевірка іноді не працює».

## Порядок і час

- Обробники OnLoad виконуються в порядку, в якому їх указано на формі; бібліотеки спершу завантажуються у своєму порядку.
- Не припускайте, що підсітки, quick view чи веб-ресурси готові в OnLoad: використовуйте їхні власні події завантаження або перевірки `isLoaded()`.
- Після збереження OnLoad не завжди виконується знову; надійні точки — `addOnPostSave` і `data.addOnLoad`.
- OnChange не спрацьовує для значень, заданих скриптом, якщо не викликати `fireOnChange()`.

## Тримайте обробники малими

Одна функція на подію, яка викликає іменовані допоміжні функції. Повертайтеся одразу, коли тип форми, роль користувача чи дані кажуть, що логіка не потрібна. Уникайте в OnLoad роботи, яка знадобиться лише згодом; завантажуйте дані, коли відкривається вкладка чи змінюється поле.

## На співбесіді

- Перелічіть події форми й коли кожна спрацьовує.
- Покажіть, як скасувати збереження і як розпізнати автозбереження.
- Поясніть асинхронні обробники OnSave і яку помилку вони виправляють.
- Поясніть, чому підсітка може бути не готова в OnLoad форми.
