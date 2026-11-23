До появи PCF-контролів і custom pages **HTML веб-ресурси** були способом додати власний інтерфейс у Dynamics: невелика HTML-сторінка, збережена в Dataverse й показана у формі, на дашборді чи в діалозі. Багато систем досі ними користуються, і вони лишаються зручними для простих сторінок.

## Типи веб-ресурсів

Веб-ресурси — це файли, збережені як компоненти рішення: **HTML**, **JavaScript**, **CSS**, **XML**, зображення (**PNG, JPG, GIF, ICO, SVG**), **XSL** і **RESX**. Їх віддають за адресою `[org]/WebResources/<name>`, тож HTML-сторінка може завантажувати власні скрипти й стилі за відносними шляхами:

```text
contoso_/html/creditcheck.html
contoso_/html/creditcheck.js
contoso_/html/creditcheck.css
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="creditcheck.css">
  <script src="creditcheck.js"></script>
</head>
<body>
  <div id="result">Loading…</div>
</body>
</html>
```

Використовуйте віртуальні теки в іменах (`contoso_/html/…`), щоб відносні шляхи працювали, а ваші файли були згруповані.

## Де вони з'являються

- **На формі**: вставте контрол *Web resource*, виберіть сторінку й задайте параметри: чи передавати id і назву таблиці запису, власний параметр `data`, рамку й прокручування, чи видимий він типово.
- **На дашбордах** і в **карті сайту** (як сторінка в навігації застосунку), з посиланням виду `$webresource:contoso_/html/report.html`.
- **У діалогах**: відкриваються через `Xrm.Navigation.navigateTo` (наступна лекція).

## Параметри

Коли на формі ввімкнено *Pass record object-type code and unique identifier as parameters*, URL сторінки містить `id`, `typename`, `orgname`, `userlcid` і `orglcid`. Власні значення йдуть в **один** параметр із назвою **`data`**; усе інше відкидається. Кодуйте кілька значень у ньому як рядок запиту чи JSON:

```javascript
const params = new URLSearchParams(location.search);
const recordId = params.get("id");                          // "{GUID}"
const data = JSON.parse(params.get("data") || "{}");        // { mode: "summary" }
```

## Контекст і виклики Dataverse

Окрема сторінка (карта сайту, дашборд) може підключити скрипт контексту платформи й викликати Web API з того самого домену, із сесією користувача:

```html
<script src="../../ClientGlobalContext.js.aspx"></script>
```

```javascript
const ctx = GetGlobalContext();
const url = ctx.getClientUrl() + "/api/data/v9.2/accounts(" + recordId.replace(/[{}]/g, "") + ")?$select=name,creditlimit";
const response = await fetch(url, { headers: { Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0" } });
const account = await response.json();
```

Сторінка працює на домені Dataverse, тож браузер автоматично надсилає автентифікацію користувача: жодних токенів у вашому коді, і діє безпека користувача. Для сторінки, вбудованої у форму, підтримуваний спосіб дістатися `Xrm` і форми — щоб скрипт форми передав їх сторінці, як показує наступна лекція.

## Безпека та якість

- Кожне значення, яке ви вставляєте в HTML, вважайте неперевіреним: використовуйте `textContent` або `Xrm.Encoding.htmlEncode`, а не `innerHTML`, складений із рядків з даними запису.
- Не вбудовуйте секрети: файл може прочитати кожен користувач, що може його відкрити.
- Тримайте сторінки малими й доступними; використовуйте шрифти й кольори застосунку, щоб вони не виглядали чужими.

## На співбесіді

- Назвіть типи веб-ресурсів і як HTML-сторінки підключають свої скрипти.
- Поясніть параметри, які форма передає вбудованій сторінці, і параметр `data`.
- Покажіть, як окрема сторінка отримує контекст і викликає Web API.
- Назвіть два правила безпеки для HTML веб-ресурсів.
