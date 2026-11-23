HTML-сторінка, вбудована у форму, працює в **iframe**. Їй часто треба читати значення форми, реагувати на їхні зміни чи записувати назад. А іноді сторінку краще відкрити як **діалог**. Для обох випадків є підтримувані шаблони.

## Із форми в сторінку: getContentWindow

Зв'язком керує скрипт форми. Коли форма завантажується, він отримує вікно сторінки й передає те, що їй потрібно:

```javascript
// Скрипт форми (OnLoad)
async function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  const control = fc.getControl("WebResource_creditsummary");
  const pageWindow = await control.getContentWindow();
  pageWindow.setClientApiContext(Xrm, fc);
}
```

```javascript
// creditcheck.js, усередині HTML веб-ресурсу
let formContext = null;

window.setClientApiContext = function (xrm, fc) {
  window.Xrm = xrm;
  formContext = fc;
  render();
  fc.getAttribute("creditlimit").addOnChange(render);    // реагувати на зміни форми
};

function render() {
  const limit = formContext.getAttribute("creditlimit").getValue();
  document.getElementById("result").textContent = limit === null ? "No limit" : "Limit: " + limit;
}
```

`getContentWindow()` повертає проміс, що завершується, коли сторінку завантажено, тож гонки між формою й iframe немає. Далі сторінка використовує **справжній контекст форми**: може читати й задавати значення, додавати обробники OnChange, показувати сповіщення. Це задокументована заміна старої звички читати `parent.Xrm.Page` зсередини iframe.

Контроли веб-ресурсу та iframe також мають `setSrc(url)` / `getSrc()`, щоб змінити сторінку, наприклад передати нове значення `data` після зміни поля.

## Зі сторінки у форму

Отримавши контекст форми, сторінка просто викликає його: `formContext.getAttribute("contoso_rating").setValue(3)`. Чітко розділіть обов'язки: або сторінка редагує значення форми (а користувач зберігає), або пише в Dataverse через `Xrm.WebApi` і просить форму оновитися через `formContext.data.refresh(false)`.

## Відкриття сторінки як діалогу

```javascript
// З команди чи скрипту форми
const pageInput = {
  pageType: "webresource",
  webresourceName: "contoso_/html/creditcheck.html",
  data: JSON.stringify({ accountId: fc.data.entity.getId() }),
};
const options = { target: 2, position: 1, width: { value: 600, unit: "px" }, height: { value: 400, unit: "px" }, title: "Credit check" };

await Xrm.Navigation.navigateTo(pageInput, options);
await fc.data.refresh(false);     // діалог міг змінити дані: перечитати їх
```

- `target: 2` відкриває модальний діалог; `position: 1` центрує його, `2` — прикріплює збоку.
- Сторінка читає `data` зі свого URL, як у попередній лекції.
- Проміс завершується, коли діалог закрито. Простий спосіб повернути результат — щоб сторінка зберегла його в Dataverse (чи `sessionStorage`) перед закриттям, а викликач прочитав його потім. Custom pages пропонують багатший спосіб повертати значення.
- У діалозі сторінка може закрити себе через `window.close()`.

## Повідомлення між вікнами

Коли жоден шаблон не підходить (наприклад, два веб-ресурси на одній формі мають спілкуватися), `window.postMessage` з перевіркою `event.origin` працює між iframe підтримуваним і явним способом. Уникайте прямого доступу до глобальних об'єктів інших фреймів.

## На співбесіді

- Покажіть, як скрипт форми передає `Xrm` і контекст форми вбудованій сторінці.
- Поясніть, чому `getContentWindow` кращий за `parent.Xrm` усередині сторінки.
- Відкрийте HTML веб-ресурс як діалог із параметрами.
- Поясніть, як дані повертаються з діалогу у форму.
