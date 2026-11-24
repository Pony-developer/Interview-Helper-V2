import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 26–38 of the Angular list: advanced level and real-world scenarios. */
export const angularAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "angular-advanced-quiz",
  title: { en: "Advanced and scenarios", uk: "Просунутий рівень і сценарії" },
  questions: [
    question(
      "ivy",
      ["What is Ivy in Angular?", "Що таке Ivy в Angular?"],
      [
        ["A UI component library", "Бібліотека UI-компонентів"],
        ["A testing framework that replaced Karma", "Фреймворк для тестування, що замінив Karma"],
        [
          "The compiler and rendering engine used by default since Angular 9 (the old View Engine was removed in 13): it compiles each component on its own, which gives smaller bundles through better tree-shaking, faster builds and clearer template errors, and it made standalone components possible",
          "Компілятор і рушій рендерингу, типовий з Angular 9 (старий View Engine прибрали в 13): він компілює кожен компонент окремо, що дає менші бандли завдяки кращому tree-shaking, швидше збирання й зрозуміліші помилки в шаблонах, а також уможливив standalone-компоненти",
        ],
        ["A server for Angular SSR", "Сервер для Angular SSR"],
      ],
      "c",
    ),
    question(
      "angular-elements",
      ["What are Angular Elements for?", "Для чого потрібні Angular Elements?"],
      [
        [
          "Packaging an Angular component as a standard custom element (web component) with `createCustomElement()` and `customElements.define()`, so it can be used on any page or in another framework, for example in a CMS or a legacy app",
          "Щоб запакувати Angular-компонент у стандартний custom element (вебкомпонент) через `createCustomElement()` і `customElements.define()` і використовувати його на будь-якій сторінці чи в іншому фреймворку, наприклад у CMS або старому застосунку",
        ],
        ["Listing all DOM elements of an Angular app", "Перелік усіх DOM-елементів Angular-застосунку"],
        ["A set of styled HTML elements, like Angular Material", "Набір стилізованих HTML-елементів, як Angular Material"],
        ["Converting React components to Angular", "Перетворення React-компонентів на Angular"],
      ],
      "a",
    ),
    question(
      "resolver",
      ["What does a route resolver do?", "Що робить resolver маршруту?"],
      [
        ["It resolves merge conflicts in routes", "Розв'язує конфлікти злиття в маршрутах"],
        ["It picks which component to show for an unknown URL", "Вибирає, який компонент показати для невідомого URL"],
        ["It loads data after the component is destroyed", "Завантажує дані після знищення компонента"],
        [
          "It fetches data before the route activates (`resolve: { user: userResolver }` with a `ResolveFn`), so the component gets it ready through `ActivatedRoute.data` or an input; the trade-off is that navigation waits for the data",
          "Він завантажує дані ще до активації маршруту (`resolve: { user: userResolver }` з `ResolveFn`), тож компонент отримує їх готовими через `ActivatedRoute.data` чи input; ціна — перехід чекає на ці дані",
        ],
      ],
      "d",
    ),
    question(
      "template-vs-reactive-forms",
      ["How do template-driven and reactive forms differ?", "Чим відрізняються template-driven і реактивні форми?"],
      [
        ["Reactive forms work only with RxJS installed separately", "Реактивні форми працюють лише з окремо встановленим RxJS"],
        [
          "Template-driven forms are defined in the template with `ngModel` (`FormsModule`), and Angular creates the model for you: fine for simple forms. Reactive forms are built in the component with `FormGroup`/`FormControl` (`ReactiveFormsModule`): explicit, synchronous, typed and easier to test, so better for complex or dynamic forms",
          "Template-driven форми описують у шаблоні через `ngModel` (`FormsModule`), а модель Angular створює сам: годиться для простих форм. Реактивні будують у компоненті через `FormGroup`/`FormControl` (`ReactiveFormsModule`): явні, синхронні, типізовані й простіші для тестування, тож кращі для складних чи динамічних форм",
        ],
        ["Template-driven forms can't be validated", "Template-driven форми не можна валідувати"],
        ["They are the same API with different names", "Це той самий API під різними назвами"],
      ],
      "b",
    ),
    question(
      "async-validator",
      [
        "A sign-up form must check that an email is valid and not already taken. How do you do it with reactive forms?",
        "Форма реєстрації має перевіряти, що email коректний і ще не зайнятий. Як це зробити реактивними формами?",
      ],
      [
        ["Check it in `ngOnDestroy`", "Перевіряти в `ngOnDestroy`"],
        ["Only with the HTML `pattern` attribute", "Лише HTML-атрибутом `pattern`"],
        [
          "Sync validators `[Validators.required, Validators.email]` plus an async validator as the third argument that calls the API and returns an `Observable`/`Promise` of `{ emailTaken: true }` or `null`; it runs only after the sync ones pass, and the control is `PENDING` meanwhile",
          "Синхронні валідатори `[Validators.required, Validators.email]` плюс асинхронний валідатор третім аргументом, що звертається до API й повертає `Observable`/`Promise` з `{ emailTaken: true }` або `null`; він запускається лише після успіху синхронних, а поле тим часом у стані `PENDING`",
        ],
        ["Async validation is not possible in Angular", "Асинхронна валідація в Angular неможлива"],
      ],
      "c",
    ),
    question(
      "angular-animations",
      ["How do you animate elements in Angular?", "Як анімувати елементи в Angular?"],
      [
        [
          "Classically with `@angular/animations`: `trigger()`, `state()`, `transition()` and `animate()` in the component metadata, bound with `[@name]`; newer versions recommend plain CSS with `animate.enter` and `animate.leave` for elements entering and leaving the DOM",
          "Класично через `@angular/animations`: `trigger()`, `state()`, `transition()` і `animate()` у метаданих компонента з прив'язкою `[@name]`; новіші версії радять звичайний CSS з `animate.enter` і `animate.leave` для елементів, що з'являються в DOM і зникають із нього",
        ],
        ["Only with jQuery `.animate()`", "Лише через `.animate()` з jQuery"],
        ["Angular can't animate elements", "Angular не вміє анімувати елементи"],
        ["Only with GIF images", "Лише GIF-зображеннями"],
      ],
      "a",
    ),
    question(
      "dynamic-components",
      ["How do you create a component dynamically at runtime?", "Як створити компонент динамічно під час виконання?"],
      [
        ["Write its HTML into `innerHTML`", "Записати його HTML в `innerHTML`"],
        ["Components can only be declared statically in templates", "Компоненти можна оголошувати лише статично в шаблонах"],
        ["With `document.createElement('app-dialog')` and nothing else", "Через `document.createElement('app-dialog')` і більше нічого"],
        [
          "With `ViewContainerRef.createComponent(DialogComponent)`, setting inputs through `componentRef.setInput()`, or declaratively with `*ngComponentOutlet`; useful for dialogs, widgets and plugin-like dashboards",
          "Через `ViewContainerRef.createComponent(DialogComponent)` із заданням inputs через `componentRef.setInput()` або декларативно через `*ngComponentOutlet`; корисно для діалогів, віджетів і дашбордів із плагінами",
        ],
      ],
      "d",
    ),
    question(
      "angular-material",
      ["What is Angular Material?", "Що таке Angular Material?"],
      [
        ["A 3D graphics engine", "Рушій 3D-графіки"],
        [
          "The official UI component library that implements Google's Material Design: buttons, dialogs, form fields, tables and more, with theming and accessibility built in; added with `ng add @angular/material`. The CDK under it gives unstyled behaviors such as overlays, drag and drop and virtual scroll",
          "Офіційна бібліотека UI-компонентів, що реалізує Material Design від Google: кнопки, діалоги, поля форм, таблиці тощо з вбудованими темами й доступністю; додається через `ng add @angular/material`. CDK під нею дає поведінку без стилів, як-от оверлеї, drag and drop і віртуальний скрол",
        ],
        ["A CSS reset", "CSS-скидання стилів"],
        ["The material for the Angular certification exam", "Матеріали до сертифікаційного іспиту з Angular"],
      ],
      "b",
    ),
    question(
      "renderer2",
      ["Why use `Renderer2` instead of touching `nativeElement` directly?", "Навіщо використовувати `Renderer2` замість прямої роботи з `nativeElement`?"],
      [
        ["It's faster because it skips the DOM", "Він швидший, бо оминає DOM"],
        ["It's required for every template binding", "Він обов'язковий для кожного зв'язування в шаблоні"],
        [
          "It's an abstraction over the DOM (`addClass`, `setStyle`, `listen` and so on), so a directive's code also works where there is no browser DOM, such as server-side rendering, and is easier to mock in tests",
          "Це абстракція над DOM (`addClass`, `setStyle`, `listen` тощо), тож код директиви працює й там, де немає браузерного DOM, як-от під час серверного рендерингу, і його простіше замокати в тестах",
        ],
        ["It renders components to PDF", "Він рендерить компоненти в PDF"],
      ],
      "c",
    ),
    question(
      "web-workers",
      ["When do Web Workers help in an Angular app?", "Коли Web Workers допомагають в Angular-застосунку?"],
      [
        [
          "For heavy CPU work such as parsing big files, image processing or complex calculations: it runs on a background thread so the UI stays responsive; create one with `ng generate web-worker` and talk to it with `postMessage`. Workers have no DOM access",
          "Для важкої роботи процесора, як-от розбір великих файлів, обробка зображень чи складні обчислення: вона виконується у фоновому потоці, тож UI лишається чуйним; створюється через `ng generate web-worker`, а спілкування — через `postMessage`. Workers не мають доступу до DOM",
        ],
        ["To update the DOM faster", "Щоб швидше оновлювати DOM"],
        ["To make HTTP requests run in parallel, which is impossible otherwise", "Щоб HTTP-запити виконувалися паралельно, бо інакше це неможливо"],
        ["To cache pages offline (that's what they are for)", "Щоб кешувати сторінки офлайн (саме для цього вони й існують)"],
      ],
      "a",
    ),
    question(
      "forkjoin",
      [
        "A page needs data from two APIs and should render only when both have answered. Which RxJS operator fits, and how does it behave?",
        "Сторінці потрібні дані з двох API, і рендерити її треба лише тоді, коли відповіли обидва. Який оператор RxJS підходить і як він поводиться?",
      ],
      [
        ["`concat`: it runs the requests one after another and emits each result", "`concat`: виконує запити один за одним і видає кожен результат"],
        [
          "`forkJoin([users$, orders$])`: runs them in parallel and emits once with an array of the last values when all complete; if any one errors, the whole thing errors",
          "`forkJoin([users$, orders$])`: виконує їх паралельно й один раз видає масив останніх значень, коли всі завершаться; якщо хоч один падає з помилкою, падає все",
        ],
        ["`switchMap`: it cancels the first request when the second starts", "`switchMap`: скасовує перший запит, коли стартує другий"],
        ["`merge`: it waits for both and emits one combined object", "`merge`: чекає на обидва й видає один спільний об'єкт"],
      ],
      "b",
    ),
    question(
      "onpush-not-updating",
      [
        "A component with `ChangeDetectionStrategy.OnPush` doesn't update after `this.user.name = 'Ann'`. Why, and what fixes it?",
        "Компонент із `ChangeDetectionStrategy.OnPush` не оновлюється після `this.user.name = 'Ann'`. Чому і як це виправити?",
      ],
      [
        ["`OnPush` components never update; switch to `Default`", "Компоненти з `OnPush` ніколи не оновлюються; треба перейти на `Default`"],
        ["Call `location.reload()`", "Викликати `location.reload()`"],
        ["Move the code into `ngOnDestroy`", "Перенести код в `ngOnDestroy`"],
        [
          "`OnPush` re-checks only when an input reference changes, an event fires in the component, the `async` pipe emits, a signal it reads changes or `markForCheck()` is called; mutating an object keeps the same reference. Replace it immutably (`this.user = { ...this.user, name: 'Ann' }`), use a signal, or call `ChangeDetectorRef.markForCheck()`",
          "`OnPush` перевіряє компонент лише тоді, коли змінюється посилання на input, у компоненті спрацьовує подія, pipe `async` видає значення, змінюється прочитаний сигнал або викликано `markForCheck()`; мутація об'єкта лишає те саме посилання. Слід замінити його іммутабельно (`this.user = { ...this.user, name: 'Ann' }`), використати сигнал або викликати `ChangeDetectorRef.markForCheck()`",
        ],
      ],
      "d",
    ),
    question(
      "auth-routes",
      ["How do you let only signed-in users open certain routes?", "Як дозволити відкривати певні маршрути лише користувачам, що увійшли?"],
      [
        [
          "Add a `canActivate` guard that checks the auth service and returns `true` or `router.createUrlTree(['/login'])` to redirect, and an interceptor that attaches the token to API calls; the server must still check the token, because client-side guards are only for UX",
          "Додати guard `canActivate`, що перевіряє сервіс автентифікації й повертає `true` або `router.createUrlTree(['/login'])` для переадресації, та інтерсептор, що додає токен до запитів API; сервер усе одно мусить перевіряти токен, бо guards на клієнті потрібні лише для UX",
        ],
        ["Hide the links with CSS", "Сховати посилання через CSS"],
        ["Check the password in the component template", "Перевіряти пароль у шаблоні компонента"],
        ["A client-side guard alone fully protects the data", "Guard на клієнті сам по собі повністю захищає дані"],
      ],
      "a",
    ),
  ],
};
