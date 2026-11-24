import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 21–34 of the additional list: intermediate level. */
export const extraIntermediateQuiz: SlideDef = {
  kind: "quiz",
  slug: "extra-intermediate-quiz",
  title: { en: "Intermediate", uk: "Середній рівень" },
  questions: [
    question(
      "html-table",
      ["Which elements build a basic HTML table?", "З яких елементів будується базова HTML-таблиця?"],
      [
        ["`<grid>`, `<row>` and `<cell>`", "`<grid>`, `<row>` і `<cell>`"],
        [
          "`<table>` with rows `<tr>`, header cells `<th>` and data cells `<td>`, optionally grouped into `<thead>`, `<tbody>` and `<tfoot>`",
          "`<table>` із рядками `<tr>`, клітинками заголовків `<th>` і клітинками даних `<td>`, за бажання згрупованими в `<thead>`, `<tbody>` і `<tfoot>`",
        ],
        ["Nested `<div>`s with `display: block`", "Вкладені `<div>` з `display: block`"],
        ["`<ul>` items with tab characters", "Пункти `<ul>` із символами табуляції"],
      ],
      "b",
    ),
    question(
      "void-elements",
      ["Which of these are void (empty) elements that have no content and no closing tag?", "Які з цих елементів порожні (void), тобто без вмісту й закривального тегу?"],
      [
        ["`<img>`", "`<img>`"],
        ["`<input>` and `<br>`", "`<input>` і `<br>`"],
        ["`<p>`", "`<p>`"],
        ["`<meta>` and `<link>`", "`<meta>` і `<link>`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "css-sprites",
      ["What is a CSS sprite?", "Що таке CSS-спрайт?"],
      [
        ["An animated character drawn with CSS", "Анімований персонаж, намальований на CSS"],
        ["A CSS file split into many small files", "CSS-файл, розбитий на багато дрібних"],
        ["A JavaScript animation library", "JavaScript-бібліотека анімацій"],
        [
          "Many small images combined into one file; each element shows its part with `background-position`, which saved HTTP requests (less important with HTTP/2 and SVG icons)",
          "Багато дрібних зображень, об'єднаних в один файл; кожен елемент показує свою частину через `background-position`, що заощаджувало HTTP-запити (менш важливо з HTTP/2 та SVG-іконками)",
        ],
      ],
      "d",
    ),
    question(
      "hoisting",
      [
        "What does this code print?\n\n```js\nconsole.log(x);\nvar x = 5;\n```",
        "Що виведе цей код?\n\n```js\nconsole.log(x);\nvar x = 5;\n```",
      ],
      [
        ["`5`", "`5`"],
        ["`undefined`: the `var` declaration is hoisted, but the assignment stays in place", "`undefined`: оголошення `var` піднімається, а присвоєння лишається на місці"],
        ["A ReferenceError", "ReferenceError"],
        ["`null`", "`null`"],
      ],
      "b",
    ),
    question(
      "type-conversion",
      ["What do `'5' + 3` and `'5' - 3` evaluate to?", "Чому дорівнюють `'5' + 3` і `'5' - 3`?"],
      [
        ["`8` and `2`", "`8` і `2`"],
        ["`'53'` and `'5-3'`", "`'53'` і `'5-3'`"],
        ["`'53'` and `2`", "`'53'` і `2`"],
        ["Both throw a TypeError", "Обидва кидають TypeError"],
      ],
      "c",
    ),
    question(
      "custom-hooks",
      ["What is a custom hook in React?", "Що таке власний хук (custom hook) у React?"],
      [
        [
          "A function whose name starts with `use` and that calls other hooks to reuse stateful logic between components; each component that calls it gets its own state",
          "Функція, назва якої починається з `use` і яка викликає інші хуки, щоб повторно використовувати логіку зі станом у різних компонентах; кожен компонент, що її викликає, отримує власний стан",
        ],
        ["A hook that must be installed from npm", "Хук, який треба встановити з npm"],
        ["A way to share one state object between all components", "Спосіб розділити один об'єкт стану між усіма компонентами"],
        ["A class component method", "Метод класового компонента"],
      ],
      "a",
    ),
    question(
      "angular-cli",
      ["What is the Angular CLI used for?", "Для чого використовують Angular CLI?"],
      [
        ["Only for deploying to Google Cloud", "Лише для розгортання в Google Cloud"],
        ["Writing CSS", "Написання CSS"],
        [
          "Creating, generating, serving, testing and building Angular apps from the command line, with commands such as `ng new`, `ng generate component`, `ng serve` and `ng build`",
          "Створення, генерування коду, запуск, тестування й збирання Angular-застосунків із командного рядка командами на кшталт `ng new`, `ng generate component`, `ng serve` і `ng build`",
        ],
        ["Debugging the browser", "Налагодження браузера"],
      ],
      "c",
    ),
    question(
      "ng-module",
      ["What is an `NgModule` in Angular, and is it still required?", "Що таке `NgModule` в Angular і чи він досі обов'язковий?"],
      [
        ["An npm package that Angular downloads at runtime", "npm-пакет, який Angular завантажує під час виконання"],
        [
          "A class with `@NgModule` that groups components, directives, pipes and providers; modern Angular uses standalone components by default, so modules are optional",
          "Клас із `@NgModule`, що групує компоненти, директиви, pipes і провайдери; сучасний Angular за замовчуванням використовує standalone-компоненти, тож модулі необов'язкові",
        ],
        ["Another name for an ES module", "Інша назва ES-модуля"],
        ["It is required for every component in every version", "Він обов'язковий для кожного компонента в усіх версіях"],
      ],
      "b",
    ),
    question(
      "angular-directives",
      ["Which statement about Angular directives is true?", "Яке твердження про директиви Angular правильне?"],
      [
        ["Directives can only change styles", "Директиви можуть змінювати лише стилі"],
        ["Directives are a feature of AngularJS only", "Директиви є лише в AngularJS"],
        ["Every directive must have its own template", "Кожна директива мусить мати власний шаблон"],
        [
          "Components are directives with a template; structural directives such as `*ngIf` and `*ngFor` add or remove elements; attribute directives such as `ngClass` change an element's look or behavior",
          "Компоненти — це директиви з шаблоном; структурні директиви, як-от `*ngIf` і `*ngFor`, додають чи прибирають елементи; атрибутні, як-от `ngClass`, змінюють вигляд чи поведінку елемента",
        ],
      ],
      "d",
    ),
    question(
      "angularjs-scope",
      ["What is `$scope` in AngularJS?", "Що таке `$scope` в AngularJS?"],
      [
        [
          "An object that connects a controller with its view: the view reads and changes its data through bindings such as `ng-model` and `{{ }}`, and changes flow both ways",
          "Об'єкт, що пов'язує контролер із його поданням: подання читає й змінює його дані через зв'язування на кшталт `ng-model` і `{{ }}`, а зміни йдуть в обидва боки",
        ],
        ["A CSS scoping feature", "Можливість ізоляції CSS"],
        ["The JavaScript `let` scope", "Область видимості `let` у JavaScript"],
        ["A testing utility", "Утиліта для тестування"],
      ],
      "a",
    ),
    question(
      "vue-instance",
      ["How do you create and mount a Vue 3 application?", "Як створити й змонтувати застосунок на Vue 3?"],
      [
        ["`new Vue.App('#app')`", "`new Vue.App('#app')`"],
        ["`Vue.render(App, document.body)`", "`Vue.render(App, document.body)`"],
        ["`ReactDOM.createRoot(el).render(App)`", "`ReactDOM.createRoot(el).render(App)`"],
        ["`createApp(App).mount('#app')`", "`createApp(App).mount('#app')`"],
      ],
      "d",
    ),
    question(
      "vue-watcher",
      ["When is a watcher the right tool in Vue?", "Коли у Vue доречний watcher?"],
      [
        ["To compute a value for the template from other data", "Щоб обчислити значення для шаблону з інших даних"],
        [
          "To run a side effect when data changes, such as fetching results when a search query changes; a value derived from other data belongs in a `computed` instead",
          "Щоб виконати побічну дію, коли змінюються дані, як-от завантажити результати, коли змінюється пошуковий запит; значенню, похідному від інших даних, місце в `computed`",
        ],
        ["To style a component", "Щоб стилізувати компонент"],
        ["To define routes", "Щоб описати маршрути"],
      ],
      "b",
    ),
    question(
      "vue-lifecycle",
      ["Which Vue 3 lifecycle hook is the right place to start a timer or subscribe to an event, and which to clean it up?", "У якому хуку життєвого циклу Vue 3 запускати таймер чи підписку на подію, а в якому їх прибирати?"],
      [
        ["`onBeforeMount` and `onMounted`", "`onBeforeMount` і `onMounted`"],
        ["`onUpdated` and `onBeforeMount`", "`onUpdated` і `onBeforeMount`"],
        ["`onMounted` to start it, and `onUnmounted` to clean it up", "`onMounted`, щоб запустити, і `onUnmounted`, щоб прибрати"],
        ["Vue has no lifecycle hooks", "У Vue немає хуків життєвого циклу"],
      ],
      "c",
    ),
    question(
      "vue-cli",
      ["What is the current recommended way to start a new Vue 3 project?", "Який зараз рекомендований спосіб створити новий проєкт на Vue 3?"],
      [
        [
          "`npm create vue@latest` (create-vue, built on Vite); the older Vue CLI (`vue create`, based on webpack) is in maintenance mode",
          "`npm create vue@latest` (create-vue на основі Vite); старіший Vue CLI (`vue create` на основі webpack) перебуває в режимі підтримки",
        ],
        ["`npx create-react-app`", "`npx create-react-app`"],
        ["`ng new`", "`ng new`"],
        ["Vue projects cannot be generated, only written by hand", "Vue-проєкти не можна згенерувати, лише написати вручну"],
      ],
      "a",
    ),
  ],
};
