Model-driven застосунки надають скриптам, що працюють на формах, у сітках і командах, об'єктну модель JavaScript — **Client API**. Знання її будови рятує від здогадок і від непідтримуваних «коротких шляхів», які ламаються з оновленнями.

## Дві точки входу

Кожен обробник отримує одне з двох:

- **`executionContext`**: передається **обробникам подій** форми та сітки (коли позначено *Pass execution context as first parameter*). Він знає, яка подія сталася, і дає доступ до форми.
- **`primaryControl`** (або `selectedControl`): передається скриптам **команд**, налаштовується в параметрах команди. У команді форми `primaryControl` *і є* контекстом форми.

```javascript
function onLoad(executionContext) {
  const formContext = executionContext.getFormContext();
}

function onCommand(primaryControl) {
  const formContext = primaryControl;
}
```

## Контекст форми

```text
formContext
├── data
│   ├── entity              запис: getId(), getEntityName(), getPrimaryAttributeValue(), save(), getIsDirty(), attributes
│   ├── process             business process flow
│   ├── refresh(save)       перечитати запис із сервера
│   └── save(options)
├── ui
│   ├── tabs / sections     розмітка
│   ├── controls            усі контроли на формі
│   ├── quickForms          quick view форми
│   ├── process             інтерфейс business process flow
│   ├── formSelector        перемикання між формами
│   ├── setFormNotification / clearFormNotification
│   ├── getFormType()       Create, Update, Read only…
│   └── close(), refreshRibbon()
├── getAttribute(name)      скорочення для data.entity.attributes.get(name)
└── getControl(name)        скорочення для ui.controls.get(name)
```

**Атрибути** — це дані (по одному на стовпець, навіть якщо він двічі на формі). **Контроли** — видимі елементи, прив'язані до атрибутів, а також підсітки, веб-ресурси, iframe, quick view і стрічка подій. Значення змінюйте на атрибуті; видимість, підписи й сповіщення — на контролі.

## Простір імен Xrm

`Xrm` глобальний і пропонує сервіси, не прив'язані до однієї форми:

| Простір імен | Для чого |
| --- | --- |
| `Xrm.WebApi` | CRUD, запити й повідомлення до Dataverse (проміси) |
| `Xrm.Navigation` | Відкривати форми, URL, веб-ресурси, діалоги alert/confirm/error, `navigateTo` |
| `Xrm.Utility` | Глобальний контекст, індикатор прогресу, діалог lookup, метадані, рядки ресурсів |
| `Xrm.App` | Сповіщення рівня застосунку, бічні панелі |
| `Xrm.Device` | Камера, геолокація, вибір файлів на мобільних |
| `Xrm.Encoding` | Допоміжні функції кодування HTML і XML |

`Xrm.Utility.getGlobalContext()` повертає **глобальний контекст**: `userSettings` (id користувача, ім'я, мова, ролі, часовий пояс), `organizationSettings`, `getClientUrl()`, `client.getClient()` і `getFormFactor()`.

## Контекст сітки

У подіях підсітки або через `formContext.getControl("Contacts")` ви отримуєте **контрол сітки**: `getGrid()` дає рядки й вибрані рядки, `refresh()` перезавантажує, `getViewSelector()` читає й змінює подання. Його використовує модуль про просунутий API.

## Застаріле: Xrm.Page

`Xrm.Page` був глобальним скороченням до «тієї самої» форми. Він застарів: у quick view, сітках і діалогах указує не на ту форму й приховує залежності. Кожен новий скрипт бере контекст форми з контексту виконання чи `primaryControl`. Будь-який знайдений `Xrm.Page` вважайте технічним боргом на заміну.

## На співбесіді

- Поясніть, як обробник отримує контекст форми в подіях і командах.
- Намалюйте основні частини контексту форми.
- Поясніть різницю між атрибутами й контролами.
- Назвіть простори імен `Xrm` і для чого кожен.
