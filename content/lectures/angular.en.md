---
skill: angular
title: "Angular fundamentals: components, bindings, DI and change detection"
summary: "How Angular components talk to each other, how dependency injection works, what triggers change detection and why OnPush matters."
readingMinutes: 9
---

Angular is a full framework: components, templates, dependency injection (DI), routing and forms come in one package. Interviews focus on data flow and change detection.

## Components and templates

A component is a class with a template. Bindings connect them:

| Syntax | Direction | Example |
| --- | --- | --- |
| `{{ value }}` | class → view (text) | `{{ user.name }}` |
| `[prop]="expr"` | class → view (property) | `[disabled]="isSaving"` |
| `(event)="handler($event)"` | view → class | `(click)="save()"` |
| `[(ngModel)]="field"` | two-way | form inputs |

Structural directives change the DOM shape: `*ngIf`, `*ngFor` (newer versions also have `@if` / `@for` blocks).

## Parent ↔ child communication

```ts
@Component({ selector: "app-stepper", template: `
  <button (click)="change(-1)" [disabled]="value <= min">−</button>
  <span>{{ value }}</span>
  <button (click)="change(1)">+</button>` })
export class StepperComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Output() valueChange = new EventEmitter<number>();

  change(delta: number) {
    this.valueChange.emit(this.value + delta);
  }
}
```

The parent writes `<app-stepper [(value)]="qty" />`. The pair `value` + `valueChange` enables banana-in-a-box two-way binding. For shared state across distant components, use a service.

## Dependency injection

Services are classes registered with an injector:

```ts
@Injectable({ providedIn: "root" })   // one app-wide singleton
export class CartService { /* ... */ }

constructor(private cart: CartService) {}  // or: cart = inject(CartService)
```

Providers can also live on a module or a component. A component-level provider gives every component instance its own service instance. DI makes code testable: tests swap in a fake provider.

## Lifecycle hooks

- `ngOnChanges`: before `ngOnInit` and whenever an `@Input` reference changes.
- `ngOnInit`: once, after the first inputs are set. Start data loading here, not in the constructor.
- `ngOnDestroy`: unsubscribe, clear timers.

## Change detection

Zone.js patches async APIs (events, timers, XHR). After each task, Angular checks the component tree top-down and updates changed bindings.

With `ChangeDetectionStrategy.OnPush`, a component is checked only when:

- an `@Input` gets a **new reference**,
- an event fires inside it,
- an `async` pipe emits,
- you call `markForCheck()`.

So with OnPush, never mutate input objects or arrays: `this.items.push(x)` will not update the child. Replace them instead: `this.items = [...this.items, x]`.

Newer versions add **signals**: reactive values that let Angular update exactly what changed, and an optional zoneless mode.

## RxJS in Angular

`HttpClient` returns Observables. Prefer the `async` pipe in templates, because it subscribes and unsubscribes for you. Otherwise unsubscribe in `ngOnDestroy`, or use `takeUntilDestroyed`.

## Interview checklist

- Show `@Input`/`@Output` and explain when you'd use a service instead.
- Explain `providedIn: "root"` vs component-level providers.
- Describe what OnPush checks and why immutability matters.
- Avoid manual subscriptions when the `async` pipe will do.
