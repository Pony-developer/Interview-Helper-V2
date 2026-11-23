Окрім окремих полів, скрипти формують саму форму: які вкладки й секції видно, які повідомлення бачать користувачі й як форма поводиться для нових і наявних записів.

## Тип форми

```javascript
const formType = formContext.ui.getFormType();
// 0 Undefined, 1 Create, 2 Update, 3 Read Only, 4 Disabled, 6 Bulk Edit
if (formType === 1) {
  formContext.getAttribute("contoso_source").setValue(3);   // типові значення лише для нових записів
}
```

Використовуйте його, щоб задавати типові значення лише під час створення, пропускати логіку на формах лише для читання й не ламати **масове редагування** (bulk edit), де багато записів редагуються разом і більша частина API форми обмежена.

## Вкладки та секції

```javascript
const tab = formContext.ui.tabs.get("tab_compliance");
tab.setVisible(isPublicSector);
tab.setDisplayState("expanded");                // або "collapsed"
tab.setFocus();

const section = tab.sections.get("section_tenders");
section.setVisible(isPublicSector);
```

Приховування секції приховує її поля, але вони лишаються на формі: обов'язкові поля в прихованих секціях усе одно блокують збереження. Змінюйте рівень обов'язковості, коли їх ховаєте.

`tab.addTabStateChange(handler)` спрацьовує, коли вкладку розгортають чи згортають, що дає змогу ліниво завантажувати дані вкладки лише тоді, коли користувач її відкриває.

## Сповіщення

Три рівні, від найширшого до найвужчого:

```javascript
// Увесь застосунок (банер угорі), зберігається між формами
// type 2 = рядок повідомлення; level 1 Success, 2 Error, 3 Warning, 4 Information
const id = await Xrm.App.addGlobalNotification({ type: 2, level: 4, message: "Maintenance tonight at 22:00", showCloseButton: true });
Xrm.App.clearGlobalNotification(id);

// Форма (смуга під заголовком)
formContext.ui.setFormNotification("This account is on credit hold.", "WARNING", "credit-hold");
formContext.ui.clearFormNotification("credit-hold");

// Одне поле (червоне повідомлення під контролом)
formContext.getControl("emailaddress1").setNotification("Use a company address.", "email-domain");
formContext.getControl("emailaddress1").clearNotification("email-domain");
```

Рівні сповіщень форми: `"ERROR"`, `"WARNING"` і `"INFO"`. Поле зі сповіщенням **блокує збереження**, доки сповіщення не прибрано, тож сповіщення полів — легкий інструмент перевірки. `addNotification` на контролі також може пропонувати **рекомендації** з кнопкою дії («Заповнити країну за містом?»).

Завжди використовуйте **унікальний id** і прибирайте сповіщення, коли умова зникла, інакше повідомлення накопичуються.

## Інші операції інтерфейсу

- `formContext.ui.refreshRibbon()` переоцінює видимість команд після зміни значення.
- `formContext.ui.close()` закриває форму.
- `formContext.ui.formSelector.items.get(id).navigate()` перемикає на іншу форму.
- `formContext.ui.headerSection.setBodyVisible(false)` та подібні керують заголовком.
- `formContext.ui.setFormEntityName("Customer")` змінює назву таблиці, показану на цій формі.

## Форми лише для читання й безпека

Вимкнення полів скриптом — інструмент **зручності**, а не безпеки. Користувач із привілеєм Write може змінити стовпець через іншу форму, сітку, Excel чи API. Для правил, що мають виконуватися, використовуйте **безпеку полів**, бізнес-правила з областю таблиці або плагіни.

## На співбесіді

- Перелічіть основні типи форм і що б ви робили по-різному для кожного.
- Поясніть, чому приховане обов'язкове поле все одно блокує збереження.
- Порівняйте сповіщення застосунку, форми й поля.
- Поясніть, чому вимкнення полів у скрипті — не безпека.
