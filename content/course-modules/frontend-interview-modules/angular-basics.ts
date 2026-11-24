import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–13 of the Angular list: basics. */
export const angularBasicsQuiz: SlideDef = {
  kind: "quiz",
  slug: "angular-basics-quiz",
  title: { en: "Basics", uk: "Основи" },
  questions: [
    question(
      "why-frameworks",
      ["Why did client-side frameworks such as Angular and React appear?", "Чому з'явилися клієнтські фреймворки на кшталт Angular і React?"],
      [
        ["Browsers stopped supporting plain JavaScript", "Браузери перестали підтримувати звичайний JavaScript"],
        ["To move all the logic to the server", "Щоб перенести всю логіку на сервер"],
        [
          "As apps grew, updating the DOM by hand with plain JavaScript or jQuery became messy; frameworks keep the UI in sync with the data automatically, split it into reusable components and give routing, forms and other tools for single-page apps",
          "Коли застосунки виросли, ручне оновлення DOM на чистому JavaScript чи jQuery стало заплутаним; фреймворки автоматично синхронізують UI з даними, ділять його на повторно використовувані компоненти й дають маршрутизацію, форми та інші інструменти для односторінкових застосунків",
        ],
        ["Only to make pages look better", "Лише щоб сторінки гарніше виглядали"],
      ],
      "c",
    ),
    question(
      "app-bootstrap",
      ["How does an Angular app start in the browser?", "Як Angular-застосунок запускається в браузері?"],
      [
        [
          "`main.ts` bootstraps the root component (`bootstrapApplication(AppComponent, appConfig)`, or `bootstrapModule(AppModule)` in module-based apps); Angular renders it in place of `<app-root>` in `index.html`, and from there the router, components and change detection take over",
          "`main.ts` запускає кореневий компонент (`bootstrapApplication(AppComponent, appConfig)` або `bootstrapModule(AppModule)` у застосунках на модулях); Angular рендерить його на місці `<app-root>` в `index.html`, а далі все беруть на себе роутер, компоненти й виявлення змін",
        ],
        ["The server renders every page and the browser only shows HTML", "Сервер рендерить кожну сторінку, а браузер лише показує HTML"],
        ["The browser reads `angular.json` and builds the app itself", "Браузер читає `angular.json` і сам збирає застосунок"],
        ["Each component is loaded by its own `<script>` tag in `index.html`", "Кожен компонент завантажується власним тегом `<script>` в `index.html`"],
      ],
      "a",
    ),
    question(
      "template-expressions",
      ["How do Angular template expressions differ from JavaScript expressions?", "Чим вирази в шаблонах Angular відрізняються від виразів JavaScript?"],
      [
        ["They are exactly the same as JavaScript", "Вони точнісінько такі самі, як у JavaScript"],
        [
          "They are evaluated against the component instance, can't declare variables, run loops or use globals like `window` and `document`, add template-only syntax such as pipes `|`, and interpolated values are escaped, which protects against XSS",
          "Вони обчислюються відносно екземпляра компонента, не можуть оголошувати змінні, запускати цикли чи звертатися до глобальних об'єктів на кшталт `window` і `document`, мають власний синтаксис шаблонів, як-от pipes `|`, а інтерпольовані значення екрануються, що захищає від XSS",
        ],
        ["They can only contain string literals", "Вони можуть містити лише рядкові літерали"],
        ["They run once at build time and never again", "Вони виконуються один раз під час збирання й більше ніколи"],
      ],
      "b",
    ),
    question(
      "inline-template",
      ["How can you give a component its template?", "Як можна задати компоненту шаблон?"],
      [
        ["Only in a separate `.html` file", "Лише в окремому файлі `.html`"],
        ["Through a `<template>` tag in `index.html`", "Через тег `<template>` в `index.html`"],
        ["By returning HTML from the constructor", "Повернувши HTML з конструктора"],
        [
          "Inline with the `template` property (a string, usually a backtick literal) or in a separate file with `templateUrl`; a component uses one or the other",
          "Вбудовано через властивість `template` (рядок, зазвичай у зворотних лапках) або в окремому файлі через `templateUrl`; компонент використовує щось одне",
        ],
      ],
      "d",
    ),
    question(
      "aot-vs-jit",
      ["How does AOT compilation differ from JIT in Angular?", "Чим компіляція AOT відрізняється від JIT в Angular?"],
      [
        ["AOT runs in the browser, JIT runs on the server", "AOT працює в браузері, а JIT — на сервері"],
        ["They are the same thing under two names", "Це одне й те саме під двома назвами"],
        [
          "AOT (ahead-of-time) compiles templates to JavaScript at build time: faster startup, smaller bundles without the compiler and template errors caught during the build; JIT (just-in-time) compiles in the browser at runtime. AOT is the default since Angular 9, for both `ng build` and `ng serve`",
          "AOT (ahead-of-time) компілює шаблони в JavaScript під час збирання: швидший старт, менші бандли без компілятора й помилки в шаблонах ловляться ще на збиранні; JIT (just-in-time) компілює в браузері під час виконання. AOT — типовий режим з Angular 9 і для `ng build`, і для `ng serve`",
        ],
        ["JIT is the recommended mode for production", "JIT — рекомендований режим для продакшену"],
      ],
      "c",
    ),
    question(
      "binding-types",
      ["Which pairings of Angular binding syntax are correct?", "Які поєднання синтаксису зв'язування в Angular правильні?"],
      [
        ["`{{ title }}`: interpolation, from the component to the view", "`{{ title }}`: інтерполяція, від компонента до подання"],
        ["`[disabled]=\"isBusy\"`: property binding, from the component to the view", "`[disabled]=\"isBusy\"`: зв'язування властивості, від компонента до подання"],
        ["`(click)=\"save()\"`: two-way binding", "`(click)=\"save()\"`: двостороннє зв'язування"],
        ["`(click)=\"save()\"`: event binding, from the view to the component", "`(click)=\"save()\"`: зв'язування події, від подання до компонента"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "di-hierarchy",
      ["Which statement about dependency injection in Angular is true?", "Яке твердження про впровадження залежностей в Angular правильне?"],
      [
        [
          "Injectors form a hierarchy: a service with `providedIn: 'root'` is one shared instance for the whole app, while one listed in a component's `providers` gets a new instance for each instance of that component and its children",
          "Інжектори утворюють ієрархію: сервіс із `providedIn: 'root'` — один спільний екземпляр на весь застосунок, а вказаний у `providers` компонента отримує новий екземпляр для кожного екземпляра цього компонента та його дочірніх",
        ],
        ["Every injection always creates a new instance", "Кожне впровадження завжди створює новий екземпляр"],
        ["Components must create their services with `new`", "Компоненти мусять створювати свої сервіси через `new`"],
        ["Dependency injection works only in AngularJS", "Впровадження залежностей працює лише в AngularJS"],
      ],
      "a",
    ),
    question(
      "view-encapsulation",
      ["How does Angular update the DOM and keep component styles from leaking?", "Як Angular оновлює DOM і не дає стилям компонентів «протікати»?"],
      [
        ["It uses a virtual DOM like React and global styles only", "Використовує віртуальний DOM, як React, і лише глобальні стилі"],
        [
          "It updates the real DOM directly where change detection finds changes, with no virtual DOM; styles are scoped by `ViewEncapsulation`: `Emulated` (the default, adds unique attributes like `_ngcontent-…`), `ShadowDom` (native Shadow DOM) or `None` (global)",
          "Він оновлює реальний DOM напряму там, де виявлення змін знайшло зміни, без віртуального DOM; стилі ізолює `ViewEncapsulation`: `Emulated` (типовий, додає унікальні атрибути на кшталт `_ngcontent-…`), `ShadowDom` (нативний Shadow DOM) або `None` (глобальні)",
        ],
        ["It always uses native Shadow DOM for every component", "Завжди використовує нативний Shadow DOM для кожного компонента"],
        ["It re-renders the whole page on every change", "Перерендерює всю сторінку за кожної зміни"],
      ],
      "b",
    ),
    question(
      "bootstrap-css",
      ["How do you add the Bootstrap CSS framework to an Angular project?", "Як додати CSS-фреймворк Bootstrap в Angular-проєкт?"],
      [
        ["It can't be used with Angular", "Його не можна використовувати з Angular"],
        ["Only by copying its CSS into every component", "Лише копіюючи його CSS у кожен компонент"],
        ["With `ng generate bootstrap`", "Через `ng generate bootstrap`"],
        [
          "Install it with `npm install bootstrap` and add its CSS to the `styles` array in `angular.json` (or import it in `styles.scss`), or link it from a CDN in `index.html`; for interactive widgets, Angular-native libraries such as ng-bootstrap avoid manual DOM scripts",
          "Встановити через `npm install bootstrap` і додати його CSS у масив `styles` в `angular.json` (або імпортувати в `styles.scss`), чи підключити з CDN в `index.html`; для інтерактивних віджетів Angular-бібліотеки на кшталт ng-bootstrap обходяться без ручних DOM-скриптів",
        ],
      ],
      "d",
    ),
    question(
      "input-output",
      ["How do `@Input()` and `@Output()` work between parent and child components?", "Як працюють `@Input()` і `@Output()` між батьківським і дочірнім компонентами?"],
      [
        ["Both send data from the child to the parent", "Обидва передають дані від дочірнього до батьківського"],
        ["They share one global variable", "Вони спільно використовують одну глобальну змінну"],
        [
          "`@Input()` passes data down from the parent (`<app-child [item]=\"selected\">`); `@Output()` is an `EventEmitter` the child uses to send events up (`<app-child (saved)=\"onSaved($event)\">`); the newer signal APIs are `input()` and `output()`",
          "`@Input()` передає дані вниз від батьківського (`<app-child [item]=\"selected\">`); `@Output()` — це `EventEmitter`, через який дочірній надсилає події вгору (`<app-child (saved)=\"onSaved($event)\">`); новіші сигнальні API — `input()` і `output()`",
        ],
        ["`@Output()` is for writing to the console", "`@Output()` потрібен для виведення в консоль"],
      ],
      "c",
    ),
    question(
      "mvvm",
      ["How does MVVM map onto an Angular app?", "Як MVVM лягає на Angular-застосунок?"],
      [
        ["Model is the template, View is the service, ViewModel is the router", "Model — шаблон, View — сервіс, ViewModel — роутер"],
        [
          "Model: the data and the services that load it; View: the template; ViewModel: the component class, which holds the state the view shows and handles its events, kept in sync through data binding",
          "Model: дані та сервіси, що їх завантажують; View: шаблон; ViewModel: клас компонента, який тримає стан для подання й обробляє його події, а синхронізацію забезпечує зв'язування даних",
        ],
        ["Angular doesn't separate data from the view", "Angular не відокремлює дані від подання"],
        ["MVVM exists only in AngularJS controllers", "MVVM є лише в контролерах AngularJS"],
      ],
      "b",
    ),
    question(
      "pure-impure-pipes",
      ["What is the difference between pure and impure pipes?", "Яка різниця між чистими (pure) і нечистими (impure) pipes?"],
      [
        [
          "A pure pipe (the default) reruns only when its input value or object reference changes, so mutating an array won't update it; an impure pipe (`pure: false`, like the built-in `async`) runs on every change detection cycle, so it must be cheap",
          "Чистий pipe (типовий) перераховується лише тоді, коли змінюється вхідне значення чи посилання на об'єкт, тож мутація масиву його не оновить; нечистий (`pure: false`, як вбудований `async`) виконується в кожному циклі виявлення змін, тож має бути дешевим",
        ],
        ["Pure pipes can't take arguments", "Чисті pipes не можуть приймати аргументи"],
        ["Impure pipes run only once", "Нечисті pipes виконуються лише один раз"],
        ["There is no difference", "Різниці немає"],
      ],
      "a",
    ),
    question(
      "custom-pipe",
      ["How do you create a custom pipe?", "Як створити власний pipe?"],
      [
        ["Extend the built-in `DatePipe`", "Успадкувати вбудований `DatePipe`"],
        ["Write a function in the template", "Написати функцію в шаблоні"],
        ["Register it in `angular.json`", "Зареєструвати його в `angular.json`"],
        [
          "Create a class with `@Pipe({ name: 'truncate' })` that implements `PipeTransform`, whose `transform(value, ...args)` returns the new value; then import it where it's used and write `{{ text | truncate:20 }}`",
          "Створити клас із `@Pipe({ name: 'truncate' })`, що реалізує `PipeTransform`, метод `transform(value, ...args)` якого повертає нове значення; потім імпортувати його там, де він потрібен, і писати `{{ text | truncate:20 }}`",
        ],
      ],
      "d",
    ),
  ],
};
