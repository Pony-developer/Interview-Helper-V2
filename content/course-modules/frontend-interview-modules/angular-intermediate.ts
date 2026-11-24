import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 14–25 of the Angular list: intermediate level. */
export const angularIntermediateQuiz: SlideDef = {
  kind: "quiz",
  slug: "angular-intermediate-quiz",
  title: { en: "Intermediate", uk: "Середній рівень" },
  questions: [
    question(
      "lazy-loading",
      ["Which statement about lazy loading in Angular is true?", "Яке твердження про ліниве завантаження в Angular правильне?"],
      [
        ["Angular loads every route's code upfront; lazy loading isn't possible", "Angular завантажує код усіх маршрутів одразу; лінивого завантаження не буває"],
        [
          "Routes with `loadComponent: () => import('./admin.component').then(m => m.AdminComponent)` or `loadChildren` go into a separate chunk that downloads on first navigation, shrinking the initial bundle; `@defer` blocks do the same for parts of a template. Eagerly loaded code is in the main bundle from the start",
          "Маршрути з `loadComponent: () => import('./admin.component').then(m => m.AdminComponent)` чи `loadChildren` потрапляють в окремий chunk, що завантажується під час першого переходу, і початковий бандл зменшується; блоки `@defer` роблять те саме для частин шаблону. Жадібно (eager) завантажений код є в головному бандлі від початку",
        ],
        ["Lazy loading means images load after scripts", "Ліниве завантаження означає, що зображення вантажаться після скриптів"],
        ["It only works for `NgModule`s, not for standalone components", "Воно працює лише для `NgModule`, а не для standalone-компонентів"],
      ],
      "b",
    ),
    question(
      "content-vs-view-hooks",
      ["How do `ngAfterContentInit` and `ngAfterViewInit` differ?", "Чим відрізняються `ngAfterContentInit` і `ngAfterViewInit`?"],
      [
        ["They are aliases of each other", "Це псевдоніми один одного"],
        ["`ngAfterViewInit` runs first, before `ngOnInit`", "`ngAfterViewInit` виконується першим, ще до `ngOnInit`"],
        ["`ngAfterContentInit` runs on every change detection cycle", "`ngAfterContentInit` виконується в кожному циклі виявлення змін"],
        [
          "`ngAfterContentInit` runs once after the content projected through `<ng-content>` is ready (`@ContentChild` is set); `ngAfterViewInit` runs once after the component's own view and child views are ready (`@ViewChild` is set). Their `…Checked` versions and `ngDoCheck` run on every check",
          "`ngAfterContentInit` виконується один раз, коли готовий вміст, переданий через `<ng-content>` (заповнено `@ContentChild`); `ngAfterViewInit` — один раз, коли готові власне подання компонента й дочірні подання (заповнено `@ViewChild`). Їхні версії `…Checked` і `ngDoCheck` виконуються під час кожної перевірки",
        ],
      ],
      "d",
    ),
    question(
      "angular-ssr",
      ["How does server-side rendering work in modern Angular?", "Як працює серверний рендеринг у сучасному Angular?"],
      [
        [
          "The `@angular/ssr` package (formerly Angular Universal), added with `ng add @angular/ssr` or `ng new --ssr`, renders pages to HTML on the server or at build time for a faster first paint and better SEO; hydration (`provideClientHydration()`) then reuses that DOM in the browser instead of re-creating it",
          "Пакет `@angular/ssr` (раніше Angular Universal), що додається через `ng add @angular/ssr` чи `ng new --ssr`, рендерить сторінки в HTML на сервері або під час збирання — для швидшого першого відображення й кращого SEO; потім гідратація (`provideClientHydration()`) повторно використовує цей DOM у браузері, а не створює його наново",
        ],
        ["Angular doesn't support SSR", "Angular не підтримує SSR"],
        ["SSR means the app runs only on the server, with no JavaScript in the browser", "SSR означає, що застосунок працює лише на сервері, без JavaScript у браузері"],
        ["SSR requires rewriting the app in Node.js", "SSR потребує переписати застосунок на Node.js"],
      ],
      "a",
    ),
    question(
      "angular-performance",
      ["Which of these speed up an Angular app?", "Що з цього прискорює Angular-застосунок?"],
      [
        ["Lazy-loaded routes and `@defer` blocks", "Ліниві маршрути й блоки `@defer`"],
        ["`OnPush` change detection and signals", "Виявлення змін `OnPush` і сигнали"],
        ["Calling methods in templates, such as `{{ total() }}` on a plain method that recalculates every time", "Виклики методів у шаблонах, як-от `{{ total() }}` для звичайного методу, що щоразу все перераховує"],
        ["A `track` expression in `@for` (or `trackBy` in `*ngFor`) so unchanged list items aren't re-created", "Вираз `track` в `@for` (чи `trackBy` у `*ngFor`), щоб незмінені елементи списку не створювалися наново"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "interceptors",
      ["What are HTTP interceptors in Angular for?", "Для чого потрібні HTTP-інтерсептори в Angular?"],
      [
        ["Blocking all requests from the browser", "Блокування всіх запитів із браузера"],
        ["Rendering components on the server", "Рендеринг компонентів на сервері"],
        [
          "They sit in the `HttpClient` pipeline and can change every request and response in one place: add an auth token header, log, show a loader, retry or handle errors globally; modern ones are functions registered with `provideHttpClient(withInterceptors([authInterceptor]))`",
          "Вони стоять у конвеєрі `HttpClient` і можуть змінювати кожен запит і відповідь в одному місці: додати заголовок із токеном, логувати, показати індикатор, повторити запит чи глобально обробити помилки; сучасні інтерсептори — це функції, які реєструють через `provideHttpClient(withInterceptors([authInterceptor]))`",
        ],
        ["Catching JavaScript errors in templates", "Перехоплення помилок JavaScript у шаблонах"],
      ],
      "c",
    ),
    question(
      "ngzone",
      ["What does `NgZone` do?", "Що робить `NgZone`?"],
      [
        ["It sets the app's time zone", "Задає часовий пояс застосунку"],
        [
          "With zone.js, it patches async APIs (events, timers, promises, XHR) so Angular knows when async work finishes and runs change detection; `runOutsideAngular()` skips that for noisy work like `mousemove` handlers. Newer apps can go zoneless and rely on signals instead",
          "Разом із zone.js він обгортає асинхронні API (події, таймери, проміси, XHR), щоб Angular знав, коли асинхронна робота завершилася, і запускав виявлення змін; `runOutsideAngular()` пропускає це для «шумної» роботи на кшталт обробників `mousemove`. Новіші застосунки можуть працювати без zone.js (zoneless) і покладатися на сигнали",
        ],
        ["It splits the app into lazy-loaded zones", "Ділить застосунок на ліниво завантажувані зони"],
        ["It isolates component styles", "Ізолює стилі компонентів"],
      ],
      "b",
    ),
    question(
      "route-guards",
      ["Which pairing of Angular route guards is correct?", "Яке поєднання guards маршрутів Angular правильне?"],
      [
        [
          "`canActivate`: may the user open this route; `canActivateChild`: its child routes; `canDeactivate`: may they leave it (unsaved changes); `canMatch`: should this route even match, so its lazy code isn't loaded (it replaced the deprecated `canLoad`)",
          "`canActivate`: чи може користувач відкрити маршрут; `canActivateChild`: його дочірні маршрути; `canDeactivate`: чи можна з нього піти (незбережені зміни); `canMatch`: чи взагалі має збігтися маршрут, щоб не вантажити його лінивий код (замінив застарілий `canLoad`)",
        ],
        ["`canActivate` runs after the component is destroyed", "`canActivate` виконується після знищення компонента"],
        ["`canDeactivate` decides whether a route can be opened", "`canDeactivate` вирішує, чи можна відкрити маршрут"],
        ["Guards protect the data on the server", "Guards захищають дані на сервері"],
      ],
      "a",
    ),
    question(
      "typed-forms",
      ["What do typed reactive forms give you?", "Що дають типізовані реактивні форми?"],
      [
        ["Forms that only accept typed keyboard input", "Форми, що приймають лише введення з клавіатури"],
        ["Automatic server-side validation", "Автоматичну валідацію на сервері"],
        ["Nothing: form values are always `any`", "Нічого: значення форм завжди `any`"],
        [
          "Since Angular 14, `FormControl<string | null>`, `FormGroup` and `FormArray` carry types, so `form.value.email` is checked by TypeScript and typos fail at compile time; `nonNullable` controls reset to their initial value instead of `null`",
          "Починаючи з Angular 14, `FormControl<string | null>`, `FormGroup` і `FormArray` мають типи, тож `form.value.email` перевіряє TypeScript, а друкарські помилки падають під час компіляції; `nonNullable`-поля скидаються до початкового значення, а не до `null`",
        ],
      ],
      "d",
    ),
    question(
      "signal-api",
      ["Which statement about Angular's signal API is true?", "Яке твердження про API сигналів в Angular правильне?"],
      [
        ["Signals are RxJS observables under a new name", "Сигнали — це RxJS observable під новою назвою"],
        ["You read a signal with `.value` and must subscribe to it", "Сигнал читають через `.value` і на нього треба підписуватися"],
        [
          "`signal(0)` creates a writable value changed with `.set()` or `.update()` and read by calling it (`count()`); `computed()` derives values lazily and caches them; `effect()` runs side effects when the signals it reads change. A template that reads a signal updates only when it changes",
          "`signal(0)` створює змінне значення, яке змінюють через `.set()` чи `.update()` і читають викликом (`count()`); `computed()` ліниво обчислює похідні значення й кешує їх; `effect()` виконує побічні дії, коли змінюються прочитані в ньому сигнали. Шаблон, що читає сигнал, оновлюється лише тоді, коли той змінився",
        ],
        ["Signals work only inside services", "Сигнали працюють лише всередині сервісів"],
      ],
      "c",
    ),
    question(
      "inject-function",
      ["Where can you call the `inject()` function?", "Де можна викликати функцію `inject()`?"],
      [
        ["Anywhere, including `ngOnInit` and click handlers", "Будь-де, зокрема в `ngOnInit` та обробниках кліків"],
        [
          "Only in an injection context: a constructor, a field initializer (`private http = inject(HttpClient)`), a provider factory, a functional guard, resolver or interceptor, or inside `runInInjectionContext()`; calling it later, for example in `ngOnInit`, throws an error",
          "Лише в контексті впровадження: у конструкторі, ініціалізаторі поля (`private http = inject(HttpClient)`), фабриці провайдера, функціональному guard, resolver чи інтерсепторі або всередині `runInInjectionContext()`; виклик пізніше, наприклад у `ngOnInit`, кидає помилку",
        ],
        ["Only in `main.ts`", "Лише в `main.ts`"],
        ["Only in templates", "Лише в шаблонах"],
      ],
      "b",
    ),
    question(
      "standalone-testing",
      ["How do you set up a test for a standalone component?", "Як налаштувати тест для standalone-компонента?"],
      [
        [
          "Put the component itself in `imports` of `TestBed.configureTestingModule({ imports: [UserCardComponent] })` (not `declarations`), since it brings its own dependencies; override or add providers for mocks and create it with `TestBed.createComponent()`",
          "Додати сам компонент в `imports` у `TestBed.configureTestingModule({ imports: [UserCardComponent] })` (а не в `declarations`), бо він приносить власні залежності; перевизначити чи додати провайдери для моків і створити його через `TestBed.createComponent()`",
        ],
        ["Wrap it in a test `NgModule` and declare it there", "Загорнути його в тестовий `NgModule` і оголосити там"],
        ["Standalone components can't be tested with `TestBed`", "Standalone-компоненти не можна тестувати через `TestBed`"],
        ["Only through end-to-end tests", "Лише через end-to-end тести"],
      ],
      "a",
    ),
    question(
      "functional-apis",
      ["Which parts of modern Angular are usually written as plain functions rather than classes?", "Які частини сучасного Angular зазвичай пишуть як звичайні функції, а не класи?"],
      [
        ["Components: Angular now has function components like React", "Компоненти: тепер в Angular є функціональні компоненти, як у React"],
        ["Pipes and directives", "Pipes і директиви"],
        ["Nothing: everything in Angular must be a class", "Нічого: усе в Angular мусить бути класом"],
        [
          "Route guards (`CanActivateFn`), resolvers (`ResolveFn`) and HTTP interceptors (`HttpInterceptorFn`), which get services through `inject()`; components, directives and pipes are still classes",
          "Guards маршрутів (`CanActivateFn`), resolvers (`ResolveFn`) і HTTP-інтерсептори (`HttpInterceptorFn`), які отримують сервіси через `inject()`; компоненти, директиви й pipes досі є класами",
        ],
      ],
      "d",
    ),
  ],
};
