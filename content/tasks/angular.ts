import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

const MODULE = `import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { StepperComponent } from "./stepper.component";

@NgModule({
  declarations: [AppComponent, StepperComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const APP = `import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <h1>Cart</h1>
    <p>Coffee beans</p>
    <app-stepper [value]="quantity" [min]="1" [max]="5" (valueChange)="quantity = $event"></app-stepper>
    <p data-testid="total">Total: {{ quantity * 12 }} USD</p>
  \`,
})
export class AppComponent {
  quantity = 1;
}
`;

export default defineTasks([
  quiz(
    "ng-binding-syntax",
    ["angular"],
    1,
    60,
    ["Binding syntax", "Синтаксис прив'язок"],
    ["Which binding passes data **from the template to the component class** when the user clicks?", "Яка прив'язка передає дані **з шаблону в клас компонента**, коли користувач клікає?"],
    [
      ['`[click]="save()"`', '`[click]="save()"`'],
      ['`(click)="save()"`', '`(click)="save()"`'],
      ['`{{ save() }}`', '`{{ save() }}`'],
      ['`*click="save()"`', '`*click="save()"`'],
    ],
    "b",
    [
      "Parentheses bind to events (view → class). Square brackets bind properties (class → view), interpolation renders text, and `*` marks structural directives.",
      "Круглі дужки прив'язують події (вигляд → клас). Квадратні дужки прив'язують властивості (клас → вигляд), інтерполяція виводить текст, а `*` позначає структурні директиви.",
    ],
  ),
  quiz(
    "ng-oninit-vs-constructor",
    ["angular"],
    2,
    90,
    ["Constructor vs ngOnInit", "Конструктор чи ngOnInit"],
    ["Why load data in `ngOnInit` rather than in the constructor?", "Чому дані краще завантажувати в `ngOnInit`, а не в конструкторі?"],
    [
      ["`@Input` values are not set yet when the constructor runs", "Під час виконання конструктора значення `@Input` ще не встановлені"],
      ["Services can't be injected into constructors", "Сервіси не можна впроваджувати в конструктори"],
      ["The constructor runs on every change detection cycle", "Конструктор виконується в кожному циклі виявлення змін"],
      ["`ngOnInit` runs before the constructor", "`ngOnInit` виконується раніше за конструктор"],
    ],
    "a",
    [
      "The constructor is for DI and simple field setup. Angular sets inputs after construction and then calls `ngOnChanges` and `ngOnInit`, so logic that depends on inputs (like loading by `id`) belongs in `ngOnInit`.",
      "Конструктор призначений для DI та простого налаштування полів. Angular встановлює вхідні дані після створення, а потім викликає `ngOnChanges` і `ngOnInit`, тож логіка, що залежить від вхідних даних (як-от завантаження за `id`), належить до `ngOnInit`.",
    ],
  ),
  quiz(
    "ng-onpush-mutation",
    ["angular", { slug: "state-management", weight: 0.5 }],
    3,
    120,
    ["OnPush and mutation", "OnPush і мутація"],
    [
      "The child list uses `ChangeDetectionStrategy.OnPush`. After `add()` runs, the child doesn't show the new item. Why?",
      "Дочірній список використовує `ChangeDetectionStrategy.OnPush`. Після виклику `add()` новий елемент у ньому не з'являється. Чому?",
    ],
    [
      ["`push` mutates the same array, so the `@Input` reference didn't change", "`push` змінює той самий масив, тож посилання `@Input` не змінилося"],
      ["OnPush components never update after the first render", "OnPush-компоненти ніколи не оновлюються після першого рендеру"],
      ["`*ngFor` doesn't support arrays of strings", "`*ngFor` не підтримує масиви рядків"],
      ["Zone.js doesn't patch click events", "Zone.js не перехоплює події кліку"],
    ],
    "a",
    [
      "OnPush checks a component when an input gets a new reference (or for its own events, async pipe emissions and `markForCheck`). Mutating the array keeps the reference, so the child is skipped. Use `this.items = [...this.items, item]`.",
      "OnPush перевіряє компонент, коли вхідні дані отримують нове посилання (а також для власних подій, значень async pipe і `markForCheck`). Мутація масиву зберігає посилання, тож дитину пропускають. Використовуйте `this.items = [...this.items, item]`.",
    ],
    { code: "// parent\nitems = ['a', 'b'];\nadd() {\n  this.items.push('c');\n}\n\n// template\n<app-list [items]=\"items\"></app-list>" },
  ),
  quiz(
    "ng-provider-scope",
    ["angular"],
    3,
    120,
    ["Provider scope", "Область дії провайдера"],
    [
      "`TimerService` is listed in a component's `providers` array. Two instances of that component are on the page. How many `TimerService` instances exist?",
      "`TimerService` вказано в масиві `providers` компонента. На сторінці два екземпляри цього компонента. Скільки існує екземплярів `TimerService`?",
    ],
    [
      ["One, services are always singletons", "Один, сервіси завжди синглтони"],
      ["Two, one per component instance", "Два, по одному на екземпляр компонента"],
      ["Zero until `providedIn: \"root\"` is added", "Нуль, доки не додано `providedIn: \"root\"`"],
      ["It depends on change detection strategy", "Залежить від стратегії виявлення змін"],
    ],
    "b",
    [
      "Component-level providers create a new injector per component instance, so each instance (and its children) gets its own service. `providedIn: \"root\"` creates one app-wide singleton instead.",
      "Провайдери на рівні компонента створюють новий інжектор для кожного екземпляра, тож кожен екземпляр (і його нащадки) отримує власний сервіс. `providedIn: \"root\"` натомість створює один синглтон на весь застосунок.",
    ],
  ),
  quiz(
    "ng-async-pipe",
    ["angular", { slug: "rxjs", weight: 0.5 }],
    4,
    150,
    ["async pipe", "async pipe"],
    ["What are the advantages of `user$ | async` over subscribing in the component? Select all that apply.", "Які переваги `user$ | async` над підпискою в компоненті? Оберіть усі правильні."],
    [
      ["It unsubscribes automatically when the component is destroyed", "Автоматично відписується, коли компонент знищено"],
      ["It marks OnPush components for check when a value arrives", "Позначає OnPush-компоненти для перевірки, коли надходить значення"],
      ["It makes the HTTP request run only once for any number of `async` pipes", "Гарантує один HTTP-запит для будь-якої кількості `async` pipe"],
      ["It removes the need to handle errors", "Позбавляє потреби обробляти помилки"],
    ],
    "ab",
    [
      "The async pipe subscribes, unsubscribes on destroy and calls `markForCheck`, so it works well with OnPush. Each `| async` is a separate subscription, though: a cold HTTP observable used twice fires two requests unless you share it (e.g. `shareReplay`). Errors still need handling.",
      "async pipe підписується, відписується при знищенні й викликає `markForCheck`, тож добре працює з OnPush. Але кожен `| async` є окремою підпискою: холодний HTTP-observable, використаний двічі, зробить два запити, якщо його не поділити (наприклад, `shareReplay`). Помилки все одно треба обробляти.",
    ],
  ),
  practice({
    slug: "ng-quantity-stepper",
    skills: ["angular"],
    complexity: 3,
    estSeconds: 900,
    framework: "angular",
    title: ["Quantity stepper component", "Компонент-лічильник кількості"],
    prompt: [
      "Implement `StepperComponent` (`app-stepper`):\n\n- Inputs: `value`, `min`, `max`. Output: `valueChange`.\n- Render a `−` button labelled `Decrease`, the value in an element with `data-testid=\"value\"`, and a `+` button labelled `Increase` (use `aria-label`).\n- Clicking emits the new value through `valueChange`. Don't mutate `value` yourself: the parent owns it.\n- Disable `Decrease` at `min` and `Increase` at `max`.\n\nThe parent `AppComponent` already wires it up and shows the total.",
      "Реалізуйте `StepperComponent` (`app-stepper`):\n\n- Вхідні дані: `value`, `min`, `max`. Вихід: `valueChange`.\n- Відрендерте кнопку `−` з міткою `Decrease`, значення в елементі з `data-testid=\"value\"` і кнопку `+` з міткою `Increase` (використайте `aria-label`).\n- Клік надсилає нове значення через `valueChange`. Не змінюйте `value` самостійно: ним володіє батько.\n- Вимикайте `Decrease` на `min` і `Increase` на `max`.\n\nБатьківський `AppComponent` уже під'єднує компонент і показує суму.",
    ],
    files: {
      "/src/app/stepper.component.ts": 'import { Component, EventEmitter, Input, Output } from "@angular/core";\n\n@Component({\n  selector: "app-stepper",\n  template: `\n    <!-- TODO: decrease button, value, increase button -->\n    <span data-testid="value">{{ value }}</span>\n  `,\n})\nexport class StepperComponent {\n  @Input() value = 0;\n  @Input() min = 0;\n  @Input() max = 10;\n  @Output() valueChange = new EventEmitter<number>();\n}\n',
      "/src/app/app.component.ts": APP,
      "/src/app/app.module.ts": MODULE,
    },
    visibleFiles: ["/src/app/stepper.component.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/stepper.component.ts",
    tests: 'import { describe, it, expect, screen, user } from "./test-kit";\n\ndescribe("app-stepper", () => {\n  it("starts at the parent value and disables Decrease at min", async () => {\n    expect(await screen.findByTestId("value")).toHaveTextContent("1");\n    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();\n  });\n  it("increases through the parent (two-way data flow)", async () => {\n    await user.click(await screen.findByRole("button", { name: "Increase" }));\n    await user.click(screen.getByRole("button", { name: "Increase" }));\n    expect(screen.getByTestId("value")).toHaveTextContent("3");\n    expect(screen.getByTestId("total")).toHaveTextContent("Total: 36 USD");\n  });\n  it("stops at max", async () => {\n    const inc = await screen.findByRole("button", { name: "Increase" });\n    await user.click(inc);\n    await user.click(inc);\n    await user.click(inc);\n    expect(screen.getByTestId("value")).toHaveTextContent("5");\n    expect(inc).toBeDisabled();\n  });\n  it("decreases", async () => {\n    await user.click(await screen.findByRole("button", { name: "Decrease" }));\n    expect(screen.getByTestId("value")).toHaveTextContent("4");\n  });\n});\n',
    solution: {
      "/src/app/stepper.component.ts": 'import { Component, EventEmitter, Input, Output } from "@angular/core";\n\n@Component({\n  selector: "app-stepper",\n  template: `\n    <button type="button" aria-label="Decrease" (click)="change(-1)" [disabled]="value <= min">−</button>\n    <span data-testid="value">{{ value }}</span>\n    <button type="button" aria-label="Increase" (click)="change(1)" [disabled]="value >= max">+</button>\n  `,\n})\nexport class StepperComponent {\n  @Input() value = 0;\n  @Input() min = 0;\n  @Input() max = 10;\n  @Output() valueChange = new EventEmitter<number>();\n\n  change(delta: number) {\n    const next = Math.min(this.max, Math.max(this.min, this.value + delta));\n    if (next !== this.value) this.valueChange.emit(next);\n  }\n}\n',
    },
    explanation: [
      "The stepper is a controlled component: it only emits the requested value, and the parent writes it back through `[value]`. `[disabled]` bindings reflect the limits, and clamping in `change()` guards against out-of-range emits.",
      "Лічильник є керованим компонентом: він лише надсилає бажане значення, а батько повертає його через `[value]`. Прив'язки `[disabled]` відображають межі, а обмеження в `change()` захищає від значень поза діапазоном.",
    ],
  }),
]);
