import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick (Angular inline templates use them). */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

/** Fails loudly if a placeholder replacement silently did nothing. */
const filled = (s: string) => {
  if (s.includes("TEMPLATE") || s.includes("SUBMIT_DISABLED")) throw new Error("Unfilled placeholder in an Angular task");
  return s;
};

const NOTE_EN =
  "The sandbox runs Angular 11 with NgModules, and its TypeScript compiler doesn't support `?.` or `??` in `.ts` files (templates are fine). The explanation shows the modern (standalone, signals) equivalent.";
const NOTE_UK =
  "Пісочниця працює на Angular 11 з NgModule, а її компілятор TypeScript не підтримує `?.` чи `??` у файлах `.ts` (у шаблонах вони працюють). У поясненні показано сучасний відповідник (standalone, сигнали).";

// ── 1. Attribute directive ────────────────────────────────────────────────────

const HIGHLIGHT_STARTER = code`import { Directive, Input } from "@angular/core";

@Directive({ selector: "[appHighlight]" })
export class HighlightDirective {
  /** The highlight colour. An empty attribute (just appHighlight) means yellow. */
  @Input() appHighlight = "";
  @Input() highlightDisabled = false;

  // TODO: set the host's background while it's hovered or focused
}
`;

const HIGHLIGHT_SOLUTION = code`import { Directive, HostBinding, HostListener, Input, OnChanges } from "@angular/core";

@Directive({ selector: "[appHighlight]" })
export class HighlightDirective implements OnChanges {
  @Input() appHighlight = "";
  @Input() highlightDisabled = false;

  /** Bound to the host element's style.backgroundColor. */
  @HostBinding("style.backgroundColor") background = "";

  private hovered = false;
  private focused = false;

  @HostListener("mouseenter") onMouseEnter() {
    this.hovered = true;
    this.update();
  }
  @HostListener("mouseleave") onMouseLeave() {
    this.hovered = false;
    this.update();
  }
  // Keyboard users get the same feedback as mouse users.
  @HostListener("focusin") onFocusIn() {
    this.focused = true;
    this.update();
  }
  @HostListener("focusout") onFocusOut() {
    this.focused = false;
    this.update();
  }

  // Inputs can change while the element is highlighted (new colour, disabled).
  ngOnChanges() {
    this.update();
  }

  private update() {
    const active = (this.hovered || this.focused) && !this.highlightDisabled;
    this.background = active ? this.appHighlight || "yellow" : "";
  }
}
`;

const HIGHLIGHT_APP = code`import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: ~
    <p appHighlight tabindex="0" data-testid="default">Hover or focus me (default colour)</p>
    <p [appHighlight]="color" tabindex="0" data-testid="custom">Hover me ({{ color }})</p>
    <p appHighlight="pink" [highlightDisabled]="disabled" tabindex="0" data-testid="toggle">Hover me unless disabled</p>
    <button type="button" (click)="disabled = !disabled">{{ disabled ? "Enable" : "Disable" }} highlight</button>
    <button type="button" (click)="color = 'orange'">Use orange</button>
  ~,
})
export class AppComponent {
  color = "lightblue";
  disabled = false;
}
`;

const HIGHLIGHT_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { HighlightDirective } from "./highlight.directive";

@NgModule({
  declarations: [AppComponent, HighlightDirective],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const HIGHLIGHT_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

const fire = (el, type) => el.dispatchEvent(type.startsWith("focus") ? new FocusEvent(type, { bubbles: true }) : new MouseEvent(type));
const bg = (el) => el.style.backgroundColor;

describe("appHighlight", () => {
  it("highlights in yellow by default and clears on mouse leave", async () => {
    const el = await screen.findByTestId("default");
    expect(bg(el)).toBe("");
    fire(el, "mouseenter");
    await waitFor(() => expect(bg(el)).toBe("yellow"));
    fire(el, "mouseleave");
    await waitFor(() => expect(bg(el)).toBe(""));
  });
  it("uses the bound colour and follows changes while highlighted", async () => {
    const el = screen.getByTestId("custom");
    fire(el, "mouseenter");
    await waitFor(() => expect(bg(el)).toBe("lightblue"));
    await user.click(screen.getByRole("button", { name: "Use orange" }));
    await waitFor(() => expect(bg(el)).toBe("orange"));
    fire(el, "mouseleave");
    await waitFor(() => expect(bg(el)).toBe(""));
  });
  it("also highlights on keyboard focus", async () => {
    const el = screen.getByTestId("default");
    fire(el, "focusin");
    await waitFor(() => expect(bg(el)).toBe("yellow"));
    fire(el, "focusout");
    await waitFor(() => expect(bg(el)).toBe(""));
  });
  it("can be disabled, which also clears an active highlight", async () => {
    const el = screen.getByTestId("toggle");
    fire(el, "mouseenter");
    await waitFor(() => expect(bg(el)).toBe("pink"));
    await user.click(screen.getByRole("button", { name: "Disable highlight" }));
    await waitFor(() => expect(bg(el)).toBe(""));
    fire(el, "mouseleave");
    fire(el, "mouseenter");
    await new Promise((r) => setTimeout(r, 50));
    expect(bg(el)).toBe("");
  });
});
`;

// ── 2. Structural directive ───────────────────────────────────────────────────

const AUTH_SERVICE = code`import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type Role = "guest" | "editor" | "admin";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly roleSubject = new BehaviorSubject<Role>("guest");
  readonly role$ = this.roleSubject.asObservable();

  setRole(role: Role) {
    this.roleSubject.next(role);
  }
}
`;

const IF_ROLE_STARTER = code`import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Role } from "./auth.service";

/**
 * *appIfRole="'admin'; else denied" renders its template when the current role is allowed,
 * the else template otherwise, and updates whenever the role changes.
 */
@Directive({ selector: "[appIfRole]" })
export class IfRoleDirective implements OnInit {
  @Input() appIfRole: Role | Role[] = [];
  @Input() appIfRoleElse: TemplateRef<unknown> | null = null;

  constructor(private template: TemplateRef<unknown>, private container: ViewContainerRef) {}

  ngOnInit() {
    // TODO: this always renders, whatever the role
    this.container.createEmbeddedView(this.template);
  }
}
`;

const IF_ROLE_SOLUTION = code`import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService, Role } from "./auth.service";

@Directive({ selector: "[appIfRole]" })
export class IfRoleDirective implements OnInit, OnDestroy {
  private allowed: Role[] = [];
  private elseTemplate: TemplateRef<unknown> | null = null;
  private role: Role | null = null;
  private shown: "then" | "else" | "none" | null = null;
  private subscription?: Subscription;

  constructor(
    private template: TemplateRef<unknown>,
    private container: ViewContainerRef,
    private auth: AuthService,
  ) {}

  @Input() set appIfRole(roles: Role | Role[]) {
    this.allowed = Array.isArray(roles) ? roles : [roles];
    this.render();
  }

  @Input() set appIfRoleElse(template: TemplateRef<unknown> | null) {
    this.elseTemplate = template;
    this.shown = null; // the else view may need replacing
    this.render();
  }

  ngOnInit() {
    this.subscription = this.auth.role$.subscribe((role) => {
      this.role = role;
      this.render();
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  private render() {
    if (this.role === null) return;
    const next = this.allowed.includes(this.role) ? "then" : this.elseTemplate ? "else" : "none";
    if (next === this.shown) return; // nothing changed: keep the existing view (and its DOM and state)
    this.container.clear();
    if (next === "then") this.container.createEmbeddedView(this.template);
    if (next === "else" && this.elseTemplate) this.container.createEmbeddedView(this.elseTemplate);
    this.shown = next;
  }
}
`;

const IF_ROLE_APP = code`import { Component } from "@angular/core";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-root",
  template: ~
    <p>Role: <strong data-testid="role">{{ auth.role$ | async }}</strong></p>
    <button type="button" (click)="auth.setRole('guest')">Guest</button>
    <button type="button" (click)="auth.setRole('editor')">Editor</button>
    <button type="button" (click)="auth.setRole('admin')">Admin</button>

    <section *appIfRole="'admin'; else denied" data-testid="admin-panel">Admin panel</section>
    <ng-template #denied><p data-testid="denied">Admins only</p></ng-template>

    <button type="button" *appIfRole="['admin', 'editor']">Edit article</button>
  ~,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
`;

const IF_ROLE_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { IfRoleDirective } from "./if-role.directive";

@NgModule({
  declarations: [AppComponent, IfRoleDirective],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const IF_ROLE_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

describe("*appIfRole", () => {
  it("shows the else template to guests", async () => {
    expect(await screen.findByTestId("denied")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-panel")).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit article" })).toBeNull();
  });
  it("shows admin content to admins, reacting to role changes", async () => {
    await user.click(screen.getByRole("button", { name: "Admin" }));
    expect(await screen.findByTestId("admin-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("denied")).toBeNull();
    expect(screen.getByRole("button", { name: "Edit article" })).toBeInTheDocument();
  });
  it("accepts a list of roles", async () => {
    await user.click(screen.getByRole("button", { name: "Editor" }));
    await waitFor(() => expect(screen.queryByTestId("admin-panel")).toBeNull());
    expect(screen.getByTestId("denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit article" })).toBeInTheDocument();
  });
  it("keeps the existing view when the outcome doesn't change", async () => {
    const edit = screen.getByRole("button", { name: "Edit article" });
    await user.click(screen.getByRole("button", { name: "Admin" }));
    await screen.findByTestId("admin-panel");
    expect(screen.getByRole("button", { name: "Edit article" })).toBe(edit);
  });
});
`;

// ── 3. Pipe ───────────────────────────────────────────────────────────────────

const PIPE_STARTER = code`import { Pipe, PipeTransform } from "@angular/core";

/** {{ bytes | fileSize }} → "1.5 KB"; {{ bytes | fileSize:2 }} for more decimals. */
@Pipe({ name: "fileSize" })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, digits = 1): string {
    return bytes + " B"; // TODO
  }
}
`;

const PIPE_SOLUTION = code`import { Pipe, PipeTransform } from "@angular/core";

const UNITS = ["B", "KB", "MB", "GB", "TB"];

// A pure pipe (the default): Angular only re-runs it when the input value or an argument changes.
@Pipe({ name: "fileSize" })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, digits = 1): string {
    if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
    let unit = 0;
    let value = bytes;
    while (value >= 1024 && unit < UNITS.length - 1) {
      value /= 1024;
      unit++;
    }
    if (unit === 0) return Math.round(value) + " B";
    const factor = 10 ** digits;
    let rounded = Math.round(value * factor) / factor;
    // 1023.99 KB rounds to 1024 KB: show it as 1 MB instead.
    if (rounded >= 1024 && unit < UNITS.length - 1) {
      unit++;
      rounded = Math.round((value / 1024) * factor) / factor;
    }
    return rounded + " " + UNITS[unit]; // number → string drops trailing zeros (1.0 → "1")
  }
}
`;

const PIPE_APP = code`import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: ~
    <ul>
      <li *ngFor="let file of files" [attr.data-testid]="file.name">{{ file.name }}: {{ file.size | fileSize }}</li>
    </ul>
    <p data-testid="precise">{{ 1234567 | fileSize: 2 }}</p>
    <p data-testid="edge">{{ 1048575 | fileSize }}</p>
    <p data-testid="negative">{{ -5 | fileSize }}</p>
    <p data-testid="missing">{{ missing | fileSize }}</p>
  ~,
})
export class AppComponent {
  missing: number | null = null;
  files = [
    { name: "empty.txt", size: 0 },
    { name: "notes.txt", size: 512 },
    { name: "logo.png", size: 1024 },
    { name: "photo.jpg", size: 1536 },
    { name: "video.mp4", size: 1.25 * 1024 ** 3 },
    { name: "backup.tar", size: 5 * 1024 ** 4 },
  ];
}
`;

const PIPE_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { FileSizePipe } from "./file-size.pipe";

@NgModule({
  declarations: [AppComponent, FileSizePipe],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const PIPE_TESTS = code`import { describe, it, expect, screen } from "./test-kit";

const text = async (id) => (await screen.findByTestId(id)).textContent.trim();

describe("fileSize pipe", () => {
  it("shows bytes below 1 KB as whole bytes", async () => {
    expect(await text("empty.txt")).toBe("empty.txt: 0 B");
    expect(await text("notes.txt")).toBe("notes.txt: 512 B");
  });
  it("uses 1024-based units with one decimal and no trailing zeros", async () => {
    expect(await text("logo.png")).toBe("logo.png: 1 KB");
    expect(await text("photo.jpg")).toBe("photo.jpg: 1.5 KB");
    expect(await text("video.mp4")).toBe("video.mp4: 1.3 GB");
    expect(await text("backup.tar")).toBe("backup.tar: 5 TB");
  });
  it("accepts the number of decimals as an argument", async () => {
    expect(await text("precise")).toBe("1.18 MB");
  });
  it("moves up a unit when rounding reaches 1024", async () => {
    expect(await text("edge")).toBe("1 MB");
  });
  it("shows a dash for invalid input", async () => {
    expect(await text("negative")).toBe("—");
    expect(await text("missing")).toBe("—");
  });
});
`;

// ── 4. Hierarchical dependency injection ──────────────────────────────────────

const DI_TOKENS = code`import { InjectionToken } from "@angular/core";

/** How much one click adds. */
export const COUNTER_STEP = new InjectionToken<number>("COUNTER_STEP");
`;

const DI_LOGGER = code`import { Injectable } from "@angular/core";

/** App-wide click log: one instance shared by everything. */
@Injectable({ providedIn: "root" })
export class ClickLogger {
  total = 0;
  record(label: string) {
    this.total++;
  }
}
`;

const DI_SERVICE_STARTER = code`import { Injectable } from "@angular/core";
import { ClickLogger } from "./click-logger.service";

// TODO: every counter should get its own instance, and the step should come from COUNTER_STEP
@Injectable({ providedIn: "root" })
export class CounterService {
  value = 0;

  constructor(private logger: ClickLogger) {}

  increment(label: string) {
    this.value += 1;
    this.logger.record(label);
  }
}
`;

const DI_SERVICE_SOLUTION = code`import { Inject, Injectable } from "@angular/core";
import { ClickLogger } from "./click-logger.service";
import { COUNTER_STEP } from "./tokens";

// Not providedIn root: each component that lists it in providers gets its own instance.
@Injectable()
export class CounterService {
  value = 0;

  constructor(@Inject(COUNTER_STEP) private step: number, private logger: ClickLogger) {}

  increment(label: string) {
    this.value += this.step;
    this.logger.record(label);
  }
}
`;

const DI_COUNTER_STARTER = code`import { Component, Input } from "@angular/core";
import { CounterService } from "./counter.service";

@Component({
  selector: "app-counter",
  template: ~
    <p>
      {{ label }}: <span [attr.data-testid]="'count-' + label">{{ counter.value }}</span>
      <button type="button" [attr.aria-label]="'Add to ' + label" (click)="counter.increment(label)">Add</button>
    </p>
  ~,
})
export class CounterComponent {
  @Input() label = "";
  constructor(public counter: CounterService) {}
}
`;

const DI_COUNTER_SOLUTION = DI_COUNTER_STARTER.replace("  `,\n})", "  `,\n  providers: [CounterService], // one CounterService per app-counter\n})");
if (DI_COUNTER_SOLUTION === DI_COUNTER_STARTER) throw new Error("DI_COUNTER_SOLUTION: replacement failed");

const DI_FAST_STARTER = code`import { Component } from "@angular/core";

/** Counters placed inside <app-fast-zone> should count in steps of 10. */
@Component({
  selector: "app-fast-zone",
  template: ~<fieldset><legend>Fast zone</legend><ng-content></ng-content></fieldset>~,
})
export class FastZoneComponent {}
`;

const DI_FAST_SOLUTION = code`import { Component } from "@angular/core";
import { COUNTER_STEP } from "./tokens";

// providers (not viewProviders) are visible to projected content, like the app-counter placed inside.
@Component({
  selector: "app-fast-zone",
  template: ~<fieldset><legend>Fast zone</legend><ng-content></ng-content></fieldset>~,
  providers: [{ provide: COUNTER_STEP, useValue: 10 }],
})
export class FastZoneComponent {}
`;

const DI_APP = code`import { Component } from "@angular/core";
import { ClickLogger } from "./click-logger.service";

@Component({
  selector: "app-root",
  template: ~
    <app-counter label="A"></app-counter>
    <app-counter label="B"></app-counter>
    <app-fast-zone>
      <app-counter label="Fast"></app-counter>
    </app-fast-zone>
    <p data-testid="total">Total clicks: {{ logger.total }}</p>
  ~,
})
export class AppComponent {
  constructor(public logger: ClickLogger) {}
}
`;

const DI_MODULE_STARTER = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { CounterComponent } from "./counter.component";
import { FastZoneComponent } from "./fast-zone.component";

@NgModule({
  declarations: [AppComponent, CounterComponent, FastZoneComponent],
  imports: [BrowserModule],
  // TODO: provide COUNTER_STEP for the whole app
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const DI_MODULE_SOLUTION = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { CounterComponent } from "./counter.component";
import { FastZoneComponent } from "./fast-zone.component";
import { COUNTER_STEP } from "./tokens";

@NgModule({
  declarations: [AppComponent, CounterComponent, FastZoneComponent],
  imports: [BrowserModule],
  providers: [{ provide: COUNTER_STEP, useValue: 1 }],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const DI_TESTS = code`import { describe, it, expect, screen, user } from "./test-kit";

describe("hierarchical injection", () => {
  it("gives each counter its own state", async () => {
    await user.click(await screen.findByRole("button", { name: "Add to A" }));
    await user.click(screen.getByRole("button", { name: "Add to A" }));
    expect(screen.getByTestId("count-A")).toHaveTextContent("2");
    expect(screen.getByTestId("count-B").textContent.trim()).toBe("0");
  });
  it("reads the step from the COUNTER_STEP token", async () => {
    await user.click(screen.getByRole("button", { name: "Add to B" }));
    expect(screen.getByTestId("count-B").textContent.trim()).toBe("1");
  });
  it("lets a parent component override the token for its content", async () => {
    await user.click(screen.getByRole("button", { name: "Add to Fast" }));
    expect(screen.getByTestId("count-Fast").textContent.trim()).toBe("10");
  });
  it("shares one root logger across all counters", async () => {
    expect(screen.getByTestId("total")).toHaveTextContent("Total clicks: 4");
  });
});
`;

const FORMS_DEPS = { "@angular/forms": "^11.2.0" };

// ── 5. Reactive form with sync, cross-field and async validators ──────────────

const USERNAME_SERVICE = code`import { Injectable } from "@angular/core";
import { Observable, timer } from "rxjs";
import { map } from "rxjs/operators";

/** Pretends to ask the server whether a username is free (100 ms round trip). */
@Injectable({ providedIn: "root" })
export class UsernameService {
  private taken = ["admin", "root"];

  isTaken(name: string): Observable<boolean> {
    return timer(100).pipe(map(() => this.taken.includes(String(name).toLowerCase())));
  }
}
`;

const SIGNUP_TEMPLATE = code`
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="username">Username</label>
      <input id="username" formControlName="username" autocomplete="username" />
      <p class="error" *ngIf="errorFor('username') as message">{{ message }}</p>

      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" autocomplete="email" />
      <p class="error" *ngIf="errorFor('email') as message">{{ message }}</p>

      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password" autocomplete="new-password" />
      <p class="error" *ngIf="errorFor('password') as message">{{ message }}</p>

      <label for="confirm">Confirm password</label>
      <input id="confirm" type="password" formControlName="confirm" autocomplete="new-password" />
      <p class="error" *ngIf="errorFor('confirm') as message">{{ message }}</p>

      <button type="submit" [disabled]="SUBMIT_DISABLED">Create account</button>
    </form>
  `;

const SIGNUP_STARTER = code`import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { UsernameService } from "./username.service";

type Field = "username" | "email" | "password" | "confirm";

@Component({
  selector: "app-signup",
  template: ~TEMPLATE~,
})
export class SignupComponent {
  @Output() created = new EventEmitter<{ username: string; email: string }>();

  // TODO: validators (sync, cross-field and async)
  form = this.fb.group({
    username: [""],
    email: [""],
    password: [""],
    confirm: [""],
  });

  constructor(private fb: FormBuilder, private usernames: UsernameService) {}

  /** The message to show under a field, or null. */
  errorFor(field: Field): string | null {
    return null; // TODO
  }

  submit() {
    this.created.emit(this.form.value); // TODO: only valid forms, only public fields, then reset
  }
}
`
  .replace("`TEMPLATE`", "`" + SIGNUP_TEMPLATE.replace("SUBMIT_DISABLED", "false") + "`");

const SIGNUP_SOLUTION = code`import { Component, EventEmitter, Output } from "@angular/core";
import { AsyncValidatorFn, FormBuilder, ValidatorFn, Validators } from "@angular/forms";
import { of, timer } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { UsernameService } from "./username.service";

type Field = "username" | "email" | "password" | "confirm";

export const hasDigit: ValidatorFn = (control) => (/\d/.test(control.value || "") ? null : { digit: true });

/** A group-level validator: it can see several controls at once. */
export const passwordsMatch: ValidatorFn = (group) => {
  const password = group.get("password");
  const confirm = group.get("confirm");
  return password && confirm && confirm.value && password.value !== confirm.value ? { mismatch: true } : null;
};

/** Async validators run only after the sync ones pass; the timer debounces typing. */
export function usernameAvailable(service: UsernameService): AsyncValidatorFn {
  return (control) =>
    !control.value
      ? of(null)
      : timer(300).pipe(
          switchMap(() => service.isTaken(control.value)),
          map((taken) => (taken ? { taken: true } : null)),
        );
}

const REQUIRED: Record<Field, string> = {
  username: "Username is required",
  email: "Email is required",
  password: "Password is required",
  confirm: "Please confirm your password",
};

@Component({
  selector: "app-signup",
  template: ~TEMPLATE~,
})
export class SignupComponent {
  @Output() created = new EventEmitter<{ username: string; email: string }>();

  form = this.fb.group(
    {
      username: ["", [Validators.required, Validators.minLength(3)], [usernameAvailable(this.usernames)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8), hasDigit]],
      confirm: ["", Validators.required],
    },
    { validators: passwordsMatch },
  );

  constructor(private fb: FormBuilder, private usernames: UsernameService) {}

  errorFor(field: Field): string | null {
    const control = this.form.get(field);
    if (!control || !(control.dirty || control.touched)) return null; // don't shout before the user has typed
    const errors = control.errors;
    if (!errors) return field === "confirm" && this.form.hasError("mismatch") ? "Passwords don't match" : null;
    if (errors.required) return REQUIRED[field];
    if (errors.minlength) return "At least " + errors.minlength.requiredLength + " characters";
    if (errors.email) return "Enter a valid email";
    if (errors.digit) return "Include a number";
    if (errors.taken) return "Username is taken";
    return null;
  }

  submit() {
    if (this.form.invalid || this.form.pending) return;
    const { username, email } = this.form.value;
    this.created.emit({ username, email }); // never pass passwords around
    this.form.reset();
  }
}
`
  .replace("`TEMPLATE`", "`" + SIGNUP_TEMPLATE.replace("SUBMIT_DISABLED", "form.invalid || form.pending") + "`");

const SIGNUP_APP = code`import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: ~
    <app-signup (created)="last = $event"></app-signup>
    <h2>Last account created</h2>
    <pre data-testid="result">{{ last | json }}</pre>
  ~,
})
export class AppComponent {
  last: { username: string; email: string } | null = null;
}
`;

const SIGNUP_MODULE = code`import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { SignupComponent } from "./signup.component";

@NgModule({
  declarations: [AppComponent, SignupComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const SIGNUP_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

const field = (label) => screen.getByLabelText(label);
const submit = () => screen.getByRole("button", { name: "Create account" });
const slow = { timeout: 2500 };

describe("signup form", () => {
  it("starts without error messages and with submit disabled", async () => {
    await screen.findByLabelText("Username");
    expect(submit()).toBeDisabled();
    expect(screen.queryByText("Username is required")).toBeNull();
  });
  it("validates the username's length, presence and availability", async () => {
    await user.type(field("Username"), "ad");
    expect(await screen.findByText("At least 3 characters")).toBeInTheDocument();
    await user.type(field("Username"), "min");
    expect(await screen.findByText("Username is taken", {}, slow)).toBeInTheDocument();
    await user.clear(field("Username"));
    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    await user.type(field("Username"), "lovelace");
    await waitFor(() => expect(screen.queryByText("Username is required")).toBeNull());
    await new Promise((r) => setTimeout(r, 600));
    expect(screen.queryByText("Username is taken")).toBeNull();
  });
  it("validates the email format", async () => {
    await user.type(field("Email"), "not-an-email");
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    await user.clear(field("Email"));
    await user.type(field("Email"), "ada@example.com");
    await waitFor(() => expect(screen.queryByText("Enter a valid email")).toBeNull());
  });
  it("requires a password of 8+ characters with a number", async () => {
    await user.type(field("Password"), "short");
    expect(await screen.findByText("At least 8 characters")).toBeInTheDocument();
    await user.type(field("Password"), "enough");
    expect(await screen.findByText("Include a number")).toBeInTheDocument();
    await user.type(field("Password"), "1");
    await waitFor(() => expect(screen.queryByText("Include a number")).toBeNull());
  });
  it("checks that both passwords match before enabling submit", async () => {
    await user.type(field("Confirm password"), "different1");
    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
    expect(submit()).toBeDisabled();
    await user.clear(field("Confirm password"));
    await user.type(field("Confirm password"), "shortenough1");
    await waitFor(() => expect(submit()).not.toBeDisabled(), slow);
    expect(screen.queryByText("Passwords don't match")).toBeNull();
  });
  it("emits only the public fields, then resets", async () => {
    await user.click(submit());
    await waitFor(() => expect(screen.getByTestId("result")).toHaveTextContent('"username": "lovelace"'));
    expect(screen.getByTestId("result")).toHaveTextContent('"email": "ada@example.com"');
    expect(screen.getByTestId("result").textContent).not.toContain("password");
    expect(field("Username").value).toBe("");
    expect(screen.queryByText("Username is required")).toBeNull();
  });
});
`;

// ── 6. Custom form control (ControlValueAccessor) ─────────────────────────────

const RATING_TEMPLATE = code`
    <div role="group" aria-label="Rating">
      <button
        type="button"
        *ngFor="let star of stars"
        [attr.aria-label]="'Rate ' + star"
        [attr.aria-pressed]="star <= value"
        [disabled]="disabled"
        (click)="select(star)"
      >{{ star <= value ? "★" : "☆" }}</button>
    </div>
  `;

const RATING_STARTER = code`import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-rating",
  template: ~TEMPLATE~,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingComponent), multi: true }],
})
export class RatingComponent implements ControlValueAccessor {
  stars = [1, 2, 3, 4, 5];
  value = 0;
  disabled = false;

  // TODO: connect the component to the forms API
  writeValue(value: number | null) {}
  registerOnChange(fn: (value: number) => void) {}
  registerOnTouched(fn: () => void) {}

  select(star: number) {
    this.value = star;
  }
}
`
  .replace("`TEMPLATE`", "`" + RATING_TEMPLATE + "`");

const RATING_SOLUTION = code`import { Component, forwardRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-rating",
  template: ~TEMPLATE~,
  // Registers this component as the value accessor for formControlName / formControl / ngModel on it.
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingComponent), multi: true }],
})
export class RatingComponent implements ControlValueAccessor {
  stars = [1, 2, 3, 4, 5];
  value = 0;
  disabled = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  /** Model → view: the form sets a value. */
  writeValue(value: number | null) {
    this.value = value || 0;
  }
  /** View → model: call fn whenever the user changes the value. */
  registerOnChange(fn: (value: number) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  select(star: number) {
    if (this.disabled) return;
    this.value = star;
    this.onChange(star);
    this.onTouched();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    if (this.disabled) return;
    if (event.key === "ArrowRight") this.select(Math.min(5, this.value + 1));
    if (event.key === "ArrowLeft") this.select(Math.max(1, this.value - 1));
  }
}
`
  .replace("`TEMPLATE`", "`" + RATING_TEMPLATE + "`");

const RATING_APP = code`import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-root",
  template: ~
    <form [formGroup]="form">
      <app-rating formControlName="rating"></app-rating>
    </form>
    <p data-testid="value">Value: {{ rating.value }}</p>
    <p data-testid="touched">Touched: {{ rating.touched }}</p>
    <button type="button" (click)="rating.setValue(2)">Set to 2</button>
    <button type="button" (click)="rating.disabled ? rating.enable() : rating.disable()">{{ rating.disabled ? "Enable" : "Disable" }}</button>
  ~,
})
export class AppComponent {
  form = new FormGroup({ rating: new FormControl(3) });

  get rating() {
    return this.form.get("rating") as FormControl;
  }
}
`;

const RATING_MODULE = code`import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { RatingComponent } from "./rating.component";

@NgModule({
  declarations: [AppComponent, RatingComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const RATING_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

const star = (n) => screen.getByRole("button", { name: "Rate " + n });
const pressed = (n) => star(n).getAttribute("aria-pressed");

describe("app-rating as a form control", () => {
  it("shows the form's initial value", async () => {
    await screen.findByRole("button", { name: "Rate 1" });
    await waitFor(() => expect(pressed(3)).toBe("true"));
    expect(pressed(4)).toBe("false");
    expect(screen.getByTestId("touched")).toHaveTextContent("Touched: false");
  });
  it("updates the form on click and marks the control touched", async () => {
    await user.click(star(5));
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("Value: 5"));
    expect(screen.getByTestId("touched")).toHaveTextContent("Touched: true");
    expect(pressed(5)).toBe("true");
  });
  it("shows values written by the form", async () => {
    await user.click(screen.getByRole("button", { name: "Set to 2" }));
    await waitFor(() => expect(pressed(3)).toBe("false"));
    expect(pressed(2)).toBe("true");
  });
  it("supports the arrow keys, staying between 1 and 5", async () => {
    await user.keyboard(star(2), "ArrowRight");
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("Value: 3"));
    await user.keyboard(star(3), "ArrowLeft");
    await user.keyboard(star(2), "ArrowLeft");
    await user.keyboard(star(1), "ArrowLeft");
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("Value: 1"));
  });
  it("is disabled and re-enabled together with its control", async () => {
    await user.click(screen.getByRole("button", { name: "Disable" }));
    await waitFor(() => expect(star(4)).toBeDisabled());
    await user.click(screen.getByRole("button", { name: "Enable" }));
    await waitFor(() => expect(star(4)).not.toBeDisabled());
  });
});
`;

// ── 7. RxJS typeahead ─────────────────────────────────────────────────────────

const SEARCH_SERVICE = code`import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

const LIBRARIES = ["Angular", "AngularJS", "Ember", "Lit", "Preact", "React", "React Native", "React Router", "Redux", "Remix", "RxJS", "Solid", "Svelte", "Vue"];

@Injectable({ providedIn: "root" })
export class SearchService {
  /** Every term actually sent to the "server", in order. */
  requests: string[] = [];

  search(term: string): Observable<string[]> {
    this.requests.push(term);
    const results = LIBRARIES.filter((name) => name.toLowerCase().includes(term.toLowerCase()));
    // Some requests are slow: the answer for "re" arrives long after later ones.
    return of(results).pipe(delay(term === "re" ? 600 : 50));
  }
}
`;

const SEARCH_TEMPLATE = code`
    <label for="search">Search libraries</label>
    <input id="search" type="search" autocomplete="off" (input)="terms.next($any($event.target).value)" />
    <p data-testid="status">{{ status }}</p>
    <ul>
      <li *ngFor="let name of results">{{ name }}</li>
    </ul>
  `;

const SEARCH_STARTER = code`import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { SearchService } from "./search.service";

@Component({
  selector: "app-search",
  template: ~TEMPLATE~,
})
export class SearchComponent implements OnInit {
  readonly terms = new Subject<string>();
  results: string[] = [];
  status = "Type at least 2 characters";

  constructor(private search: SearchService) {}

  ngOnInit() {
    // TODO: wait for a pause, skip short and repeated terms, drop stale responses, unsubscribe on destroy
    this.terms.pipe(mergeMap((term) => this.search.search(term))).subscribe((results) => (this.results = results));
  }
}
`
  .replace("`TEMPLATE`", "`" + SEARCH_TEMPLATE + "`");

const SEARCH_SOLUTION = code`import { Component, OnDestroy, OnInit } from "@angular/core";
import { of, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { SearchService } from "./search.service";

const HINT = "Type at least 2 characters";
const SEARCHING = "Searching…";

@Component({
  selector: "app-search",
  template: ~TEMPLATE~,
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly terms = new Subject<string>();
  results: string[] = [];
  status = HINT;
  private subscription = new Subscription();

  constructor(private search: SearchService) {}

  ngOnInit() {
    this.subscription.add(
      this.terms
        .pipe(
          debounceTime(250), // wait until typing pauses
          map((term) => term.trim()),
          distinctUntilChanged(), // "react " is still "react": don't search again
          tap((term) => (this.status = term.length < 2 ? HINT : SEARCHING)),
          // switchMap unsubscribes from the previous request, so a slow stale answer can't overwrite a newer one
          switchMap((term) => (term.length < 2 ? of([]) : this.search.search(term))),
        )
        .subscribe((results) => {
          this.results = results;
          if (this.status === SEARCHING) this.status = results.length ? results.length + " results" : "No results";
        }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
`
  .replace("`TEMPLATE`", "`" + SEARCH_TEMPLATE + "`");

const SEARCH_APP = code`import { Component } from "@angular/core";
import { SearchService } from "./search.service";

@Component({
  selector: "app-root",
  template: ~
    <app-search></app-search>
    <p data-testid="requests">Requests: {{ service.requests.join(", ") }}</p>
  ~,
})
export class AppComponent {
  constructor(public service: SearchService) {}
}
`;

const SEARCH_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { SearchComponent } from "./search.component";

@NgModule({
  declarations: [AppComponent, SearchComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const SEARCH_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

const input = () => screen.getByLabelText("Search libraries");
const requests = () => screen.getByTestId("requests").textContent.replace("Requests:", "").trim();
const items = () => Array.from(document.querySelectorAll("app-search li")).map((li) => li.textContent.trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slow = { timeout: 2500 };

describe("typeahead search", () => {
  it("searches once typing pauses", async () => {
    await screen.findByLabelText("Search libraries");
    await user.type(input(), "ang");
    await waitFor(() => expect(items()).toEqual(["Angular", "AngularJS"]), slow);
    expect(requests()).toBe("ang");
    expect(screen.getByTestId("status")).toHaveTextContent("2 results");
  });
  it("doesn't search for fewer than 2 characters", async () => {
    await user.clear(input());
    await user.type(input(), "a");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("Type at least 2 characters"), slow);
    expect(items()).toEqual([]);
    expect(requests()).toBe("ang");
  });
  it("never shows a stale response", async () => {
    await user.clear(input());
    await user.type(input(), "re");
    await sleep(400); // the slow request for "re" is now in flight
    await user.type(input(), "act");
    await waitFor(() => expect(items()).toEqual(["Preact", "React", "React Native", "React Router"]), slow);
    await sleep(700); // by now the "re" response would have arrived
    expect(items()).toEqual(["Preact", "React", "React Native", "React Router"]);
    expect(requests()).toBe("ang, re, react");
  });
  it("doesn't repeat a search for the same term", async () => {
    await user.type(input(), " ");
    await sleep(500);
    expect(requests()).toBe("ang, re, react");
  });
  it("says when nothing matches", async () => {
    await user.clear(input());
    await user.type(input(), "zzz");
    expect(await screen.findByText("No results", {}, slow)).toBeInTheDocument();
  });
});
`;

// ── 8. OnPush and immutable updates ───────────────────────────────────────────

const TODO_TYPES = code`export type Todo = { id: number; title: string; done: boolean };
`;

const TODO_LIST_STARTER = code`import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Todo } from "./todo";

@Component({
  selector: "app-todo-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ~
    <p data-testid="remaining">{{ remaining }} left</p>
    <ul>
      <li *ngFor="let todo of todos" [class.done]="todo.done">
        <label><input type="checkbox" [checked]="todo.done" (change)="toggle.emit(todo.id)" /> {{ todo.title }}</label>
      </li>
    </ul>
  ~,
})
export class TodoListComponent {
  @Input() todos: Todo[] = [];
  @Output() toggle = new EventEmitter<number>();

  get remaining() {
    return this.todos.filter((todo) => !todo.done).length;
  }
}
`;

const TODO_LIST_SOLUTION = TODO_LIST_STARTER.replace('*ngFor="let todo of todos"', '*ngFor="let todo of todos; trackBy: trackById"').replace(
  "  get remaining() {",
  "  /** Rows are matched by id, so replacing a todo object updates its row instead of re-creating it. */\n  trackById(index: number, todo: Todo) {\n    return todo.id;\n  }\n\n  get remaining() {",
);
if (TODO_LIST_SOLUTION === TODO_LIST_STARTER) throw new Error("TODO_LIST_SOLUTION: replacement failed");

const TODO_APP_TEMPLATE = code`
    <label for="title">New todo</label>
    <input id="title" #title (keydown.enter)="add(title)" />
    <button type="button" (click)="add(title)">Add</button>
    <button type="button" (click)="completeAll()">Complete all</button>
    <app-todo-list [todos]="todos" (toggle)="toggle($event)"></app-todo-list>
  `;

const TODO_APP_STARTER = code`import { Component } from "@angular/core";
import { Todo } from "./todo";

@Component({
  selector: "app-root",
  template: ~TEMPLATE~,
})
export class AppComponent {
  todos: Todo[] = [
    { id: 1, title: "Write tests", done: false },
    { id: 2, title: "Ship it", done: false },
  ];
  private nextId = 3;

  // TODO: the OnPush list only re-renders when it receives a new array
  add(input: HTMLInputElement) {
    const title = input.value.trim();
    if (!title) return;
    this.todos.push({ id: this.nextId++, title, done: false });
    input.value = "";
  }

  toggle(id: number) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) todo.done = !todo.done;
  }

  completeAll() {
    this.todos.forEach((todo) => (todo.done = true));
  }
}
`
  .replace("`TEMPLATE`", "`" + TODO_APP_TEMPLATE + "`");

const TODO_APP_SOLUTION = code`import { Component } from "@angular/core";
import { Todo } from "./todo";

@Component({
  selector: "app-root",
  template: ~TEMPLATE~,
})
export class AppComponent {
  todos: Todo[] = [
    { id: 1, title: "Write tests", done: false },
    { id: 2, title: "Ship it", done: false },
  ];
  private nextId = 3;

  // Every change produces a new array (and new objects only for the todos that changed),
  // so the OnPush list sees a new @Input reference and re-renders.
  add(input: HTMLInputElement) {
    const title = input.value.trim();
    if (!title) return;
    this.todos = [...this.todos, { id: this.nextId++, title, done: false }];
    input.value = "";
  }

  toggle(id: number) {
    this.todos = this.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  }

  completeAll() {
    this.todos = this.todos.map((todo) => (todo.done ? todo : { ...todo, done: true }));
  }
}
`
  .replace("`TEMPLATE`", "`" + TODO_APP_TEMPLATE + "`");

const TODO_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { TodoListComponent } from "./todo-list.component";

@NgModule({
  declarations: [AppComponent, TodoListComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const TODO_TESTS = code`import { describe, it, expect, screen, user, waitFor, within } from "./test-kit";

const rows = () => Array.from(document.querySelectorAll("app-todo-list li"));

describe("OnPush todo list", () => {
  it("shows todos added by the parent", async () => {
    const input = await screen.findByLabelText("New todo");
    await user.type(input, "Buy milk");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(rows().length).toBe(3));
    expect(rows()[2]).toHaveTextContent("Buy milk");
    expect(screen.getByTestId("remaining")).toHaveTextContent("3 left");
    expect(input.value).toBe("");
  });
  it("updates a toggled todo without re-creating any rows", async () => {
    const [first, second] = rows();
    await user.click(within(second).getByRole("checkbox"));
    await waitFor(() => expect(screen.getByTestId("remaining")).toHaveTextContent("2 left"));
    expect(rows()[1].className).toContain("done");
    expect(rows()[0]).toBe(first);
    expect(rows()[1]).toBe(second);
  });
  it("reflects changes the parent makes to every todo", async () => {
    await user.click(screen.getByRole("button", { name: "Complete all" }));
    await waitFor(() => expect(screen.getByTestId("remaining")).toHaveTextContent("0 left"));
    rows().forEach((row) => expect(row.className).toContain("done"));
  });
});
`;

// ── 9. Tabs: content projection, ContentChildren and DI to the parent ─────────

const TABS_STARTER = code`import { Component, Input } from "@angular/core";

/**
 * <app-tabs> renders a tab button for every <app-tab> placed inside it and shows only the
 * active tab's content. TODO: everything (see the task).
 */
@Component({
  selector: "app-tabs",
  template: ~<ng-content></ng-content>~,
})
export class TabsComponent {}

@Component({
  selector: "app-tab",
  template: ~<div role="tabpanel"><ng-content></ng-content></div>~,
})
export class TabComponent {
  @Input() title = "";
}
`;

const TABS_SOLUTION = code`import { Component, ContentChildren, EventEmitter, forwardRef, Input, Output, QueryList } from "@angular/core";

@Component({
  selector: "app-tabs",
  template: ~
    <div role="tablist" (keydown)="onKeydown($event)">
      <button
        type="button"
        role="tab"
        *ngFor="let tab of tabs"
        [attr.aria-selected]="tab === activeTab"
        [attr.tabindex]="tab === activeTab ? 0 : -1"
        (click)="select(tab)"
      >{{ tab.title }}</button>
    </div>
    <ng-content></ng-content>
  ~,
})
export class TabsComponent {
  // forwardRef: TabComponent is declared below this class.
  @ContentChildren(forwardRef(() => TabComponent)) tabs!: QueryList<TabComponent>;
  @Output() selectedChange = new EventEmitter<string>();

  private selected: TabComponent | null = null;

  /** Derived, not stored: if the selected tab disappears, the first tab becomes active. */
  get activeTab(): TabComponent | null {
    const list = this.tabs ? this.tabs.toArray() : [];
    if (this.selected && list.indexOf(this.selected) >= 0) return this.selected;
    return list.length ? list[0] : null;
  }

  select(tab: TabComponent) {
    if (tab === this.activeTab) return;
    this.selected = tab;
    this.selectedChange.emit(tab.title);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const list = this.tabs.toArray();
    const active = this.activeTab;
    if (!active) return;
    const step = event.key === "ArrowRight" ? 1 : -1;
    this.select(list[(list.indexOf(active) + step + list.length) % list.length]);
  }
}

@Component({
  selector: "app-tab",
  template: ~<div role="tabpanel" *ngIf="active" [attr.aria-label]="title"><ng-content></ng-content></div>~,
})
export class TabComponent {
  @Input() title = "";

  // A tab asks its parent (found through the element injector) whether it's the active one.
  constructor(private tabs: TabsComponent) {}

  get active() {
    return this.tabs.activeTab === this;
  }
}
`;

const TABS_APP = code`import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: ~
    <app-tabs (selectedChange)="selected = $event">
      <app-tab title="Overview">Overview content</app-tab>
      <app-tab title="Specs">Specs content</app-tab>
      <app-tab title="Reviews" *ngIf="showReviews">Reviews content</app-tab>
    </app-tabs>
    <button type="button" (click)="showReviews = !showReviews">Toggle reviews</button>
    <p data-testid="selected">Selected: {{ selected }}</p>
  ~,
})
export class AppComponent {
  selected = "Overview";
  showReviews = false;
}
`;

const TABS_MODULE = code`import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { TabComponent, TabsComponent } from "./tabs.component";

@NgModule({
  declarations: [AppComponent, TabsComponent, TabComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
`;

const TABS_TESTS = code`import { describe, it, expect, screen, user, waitFor } from "./test-kit";

const tabs = () => screen.getAllByRole("tab");
const tab = (name) => screen.getByRole("tab", { name });
const selected = (name) => tab(name).getAttribute("aria-selected");

describe("tabs", () => {
  it("renders a button per tab and selects the first", async () => {
    await screen.findByRole("tablist");
    expect(tabs().map((t) => t.textContent.trim())).toEqual(["Overview", "Specs"]);
    expect(selected("Overview")).toBe("true");
    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.queryByText("Specs content")).toBeNull();
  });
  it("switches on click and reports the selection", async () => {
    await user.click(tab("Specs"));
    await waitFor(() => expect(screen.getByText("Specs content")).toBeInTheDocument());
    expect(screen.queryByText("Overview content")).toBeNull();
    expect(selected("Specs")).toBe("true");
    expect(selected("Overview")).toBe("false");
    expect(screen.getByTestId("selected")).toHaveTextContent("Selected: Specs");
  });
  it("picks up tabs added later", async () => {
    await user.click(screen.getByRole("button", { name: "Toggle reviews" }));
    await waitFor(() => expect(tabs().length).toBe(3));
    await user.click(tab("Reviews"));
    await waitFor(() => expect(screen.getByText("Reviews content")).toBeInTheDocument());
  });
  it("falls back to the first tab when the active one is removed", async () => {
    await user.click(screen.getByRole("button", { name: "Toggle reviews" }));
    await waitFor(() => expect(tabs().length).toBe(2));
    expect(selected("Overview")).toBe("true");
    expect(screen.getByText("Overview content")).toBeInTheDocument();
  });
  it("moves between tabs with the arrow keys, wrapping around", async () => {
    await user.keyboard(tab("Overview"), "ArrowRight");
    await waitFor(() => expect(selected("Specs")).toBe("true"));
    await user.keyboard(tab("Specs"), "ArrowRight");
    await waitFor(() => expect(selected("Overview")).toBe("true"));
    await user.keyboard(tab("Overview"), "ArrowLeft");
    await waitFor(() => expect(selected("Specs")).toBe("true"));
  });
});
`;

export default defineTasks([
  practice({
    slug: "ng-highlight-directive",
    skills: ["angular", w("dom-events"), w("web-accessibility", 0.3)],
    complexity: 2,
    estSeconds: 720,
    framework: "angular",
    title: ["An attribute directive: appHighlight", "Атрибутна директива appHighlight"],
    prompt: [
      "Implement `HighlightDirective` (`[appHighlight]`) in `highlight.directive.ts`:\n\n- While the host element is **hovered or focused** (so keyboard users see it too), set its background colour to the value of `appHighlight`, or `yellow` when the attribute is empty. Clear it when the pointer leaves or focus moves away.\n- If the colour changes while the element is highlighted, update it immediately.\n- When `highlightDisabled` becomes `true`, clear any active highlight and stop highlighting.\n\nUse `@HostBinding` and `@HostListener` rather than touching the DOM directly. " + NOTE_EN,
      "Реалізуйте `HighlightDirective` (`[appHighlight]`) у `highlight.directive.ts`:\n\n- Поки на елемент **наведено курсор або він у фокусі** (щоб користувачі клавіатури теж це бачили), встановлюйте фон кольору зі значення `appHighlight` або `yellow`, коли атрибут порожній. Прибирайте його, коли курсор іде з елемента чи фокус переходить деінде.\n- Якщо колір змінюється, поки елемент підсвічено, одразу оновлюйте його.\n- Коли `highlightDisabled` стає `true`, прибирайте активне підсвічування й більше не підсвічуйте.\n\nВикористовуйте `@HostBinding` і `@HostListener`, а не змінюйте DOM напряму. " + NOTE_UK,
    ],
    files: {
      "/src/app/highlight.directive.ts": HIGHLIGHT_STARTER,
      "/src/app/app.component.ts": HIGHLIGHT_APP,
      "/src/app/app.module.ts": HIGHLIGHT_MODULE,
    },
    visibleFiles: ["/src/app/highlight.directive.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/highlight.directive.ts",
    tests: HIGHLIGHT_TESTS,
    solution: { "/src/app/highlight.directive.ts": HIGHLIGHT_SOLUTION },
    explanation: [
      "An attribute directive changes the behaviour or look of an existing element. `@HostListener` subscribes to the host's events (and runs change detection afterwards), and `@HostBinding(\"style.backgroundColor\")` keeps the style in sync with a property, so the directive never queries or mutates the DOM itself, which keeps it safe for server rendering. Keeping `hovered` and `focused` as separate flags and deriving the colour in one `update()` method, also called from `ngOnChanges`, makes input changes take effect immediately. In modern Angular you'd write the same with `host: { '(mouseenter)': '…', '[style.backgroundColor]': 'background()' }` and `input()` signals in a standalone directive.",
      "Атрибутна директива змінює поведінку чи вигляд наявного елемента. `@HostListener` підписується на події хост-елемента (і після них запускає виявлення змін), а `@HostBinding(\"style.backgroundColor\")` синхронізує стиль із властивістю, тож директива ніколи сама не шукає й не змінює DOM, і це робить її безпечною для серверного рендеру. Окремі прапорці `hovered` і `focused` та обчислення кольору в одному методі `update()`, який викликається й з `ngOnChanges`, змушують зміни вхідних даних діяти одразу. У сучасному Angular те саме пишуть через `host: { '(mouseenter)': '…', '[style.backgroundColor]': 'background()' }` і сигнали `input()` у standalone-директиві.",
    ],
  }),
  practice({
    slug: "ng-if-role-directive",
    skills: ["angular", w("rxjs"), w("auth", 0.3)],
    complexity: 3,
    estSeconds: 1200,
    framework: "angular",
    title: ["A structural directive: *appIfRole", "Структурна директива *appIfRole"],
    prompt: [
      "Implement `IfRoleDirective` in `if-role.directive.ts`, so templates can write `*appIfRole=\"'admin'; else denied\"` or `*appIfRole=\"['admin', 'editor']\"`:\n\n- Render the template when the current role from `AuthService.role$` is one of the allowed roles; otherwise render the `else` template if one is given, or nothing.\n- React to role changes, and unsubscribe when the directive is destroyed.\n- Don't recreate a view when the outcome doesn't change (the DOM and any state inside must survive).\n\nUse `TemplateRef` and `ViewContainerRef`. " + NOTE_EN,
      "Реалізуйте `IfRoleDirective` в `if-role.directive.ts`, щоб у шаблонах можна було писати `*appIfRole=\"'admin'; else denied\"` чи `*appIfRole=\"['admin', 'editor']\"`:\n\n- Рендерте шаблон, коли поточна роль з `AuthService.role$` є серед дозволених; інакше рендерте шаблон `else`, якщо його передано, або нічого.\n- Реагуйте на зміну ролі й відписуйтеся, коли директиву знищено.\n- Не створюйте подання заново, коли результат не змінюється (DOM і будь-який стан усередині мають зберегтися).\n\nВикористайте `TemplateRef` і `ViewContainerRef`. " + NOTE_UK,
    ],
    files: {
      "/src/app/if-role.directive.ts": IF_ROLE_STARTER,
      "/src/app/auth.service.ts": AUTH_SERVICE,
      "/src/app/app.component.ts": IF_ROLE_APP,
      "/src/app/app.module.ts": IF_ROLE_MODULE,
    },
    visibleFiles: ["/src/app/if-role.directive.ts", "/src/app/auth.service.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/if-role.directive.ts",
    tests: IF_ROLE_TESTS,
    solution: { "/src/app/if-role.directive.ts": IF_ROLE_SOLUTION },
    explanation: [
      "The `*` is sugar: Angular wraps the element in an `<ng-template>` and passes the expression to the `appIfRole` input and `else denied` to `appIfRoleElse` (the selector name plus the capitalised keyword). The directive receives that template as a `TemplateRef` and decides what to stamp into its `ViewContainerRef`. Tracking which view is currently shown and returning early when nothing changes avoids destroying and recreating DOM (and any component state inside) on every emission. Subscribing in `ngOnInit` and unsubscribing in `ngOnDestroy` prevents leaks when the directive's host disappears. Today you might implement the same check as a route guard or with `@if (canEdit())` and a computed signal, but structural directives remain the way to package reusable template logic.",
      "`*` є синтаксичним цукром: Angular загортає елемент в `<ng-template>` і передає вираз у вхідні дані `appIfRole`, а `else denied` у `appIfRoleElse` (назва селектора плюс ключове слово з великої літери). Директива отримує цей шаблон як `TemplateRef` і вирішує, що вставити у свій `ViewContainerRef`. Відстеження поточного показаного подання й ранній вихід, коли нічого не змінилося, запобігають знищенню й повторному створенню DOM (і будь-якого стану компонентів усередині) на кожне значення. Підписка в `ngOnInit` і відписка в `ngOnDestroy` запобігають витокам, коли хост директиви зникає. Сьогодні ту саму перевірку можна реалізувати як guard маршруту чи через `@if (canEdit())` з обчислюваним сигналом, але структурні директиви лишаються способом пакувати багаторазову логіку шаблонів.",
    ],
  }),
  practice({
    slug: "ng-file-size-pipe",
    skills: ["angular", w("typescript")],
    complexity: 2,
    estSeconds: 600,
    framework: "angular",
    title: ["A pure pipe with arguments: fileSize", "Чиста pipe з аргументами: fileSize"],
    prompt: [
      "Implement `FileSizePipe` (`fileSize`) in `file-size.pipe.ts`:\n\n- Sizes below 1024 show as whole bytes: `0 B`, `512 B`.\n- Larger sizes use 1024-based units `KB`, `MB`, `GB`, `TB`, rounded to `digits` decimals (the pipe argument, default 1) **without trailing zeros**: `1 KB`, `1.5 KB`, `1.3 GB`; `{{ 1234567 | fileSize:2 }}` is `1.18 MB`.\n- If rounding reaches 1024, move up a unit: `1048575` shows as `1 MB`, not `1024 KB`.\n- Negative numbers, `NaN`, `null` and `undefined` show as `—`.\n\n" + NOTE_EN,
      "Реалізуйте `FileSizePipe` (`fileSize`) у `file-size.pipe.ts`:\n\n- Розміри менші за 1024 показуються цілими байтами: `0 B`, `512 B`.\n- Більші розміри використовують одиниці з основою 1024 `KB`, `MB`, `GB`, `TB`, округлені до `digits` знаків після коми (аргумент pipe, за замовчуванням 1) **без нулів у кінці**: `1 KB`, `1.5 KB`, `1.3 GB`; `{{ 1234567 | fileSize:2 }}` дає `1.18 MB`.\n- Якщо округлення доходить до 1024, переходьте до наступної одиниці: `1048575` показується як `1 MB`, а не `1024 KB`.\n- Від'ємні числа, `NaN`, `null` і `undefined` показуються як `—`.\n\n" + NOTE_UK,
    ],
    files: {
      "/src/app/file-size.pipe.ts": PIPE_STARTER,
      "/src/app/app.component.ts": PIPE_APP,
      "/src/app/app.module.ts": PIPE_MODULE,
    },
    visibleFiles: ["/src/app/file-size.pipe.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/file-size.pipe.ts",
    tests: PIPE_TESTS,
    solution: { "/src/app/file-size.pipe.ts": PIPE_SOLUTION },
    explanation: [
      "A pipe is a pure function exposed to templates. Pipes are **pure** by default: Angular calls `transform` again only when the input reference or an argument changes, so formatting in a pipe is cheaper than calling a method from the template, which runs on every change detection. (An impure pipe, `pure: false`, runs every time, which is needed only for things like the `async` pipe.) The implementation divides by 1024 until the value fits, rounds with `Math.round(value * 10 ** digits) / 10 ** digits` and lets number-to-string conversion drop trailing zeros, then handles the edge case where rounding itself reaches the next unit. In modern Angular the pipe would be `standalone: true` (the default since v19) and imported directly by the components that use it.",
      "Pipe є чистою функцією, доступною в шаблонах. Pipe за замовчуванням **чисті**: Angular знову викликає `transform`, лише коли змінюється посилання на вхідне значення чи аргумент, тож форматування в pipe дешевше за виклик методу з шаблону, що виконується під час кожного виявлення змін. (Нечиста pipe, `pure: false`, виконується щоразу, і це потрібно лише для таких речей, як pipe `async`.) Реалізація ділить на 1024, доки значення не вміститься, округлює через `Math.round(value * 10 ** digits) / 10 ** digits` і дає перетворенню числа на рядок відкинути нулі в кінці, а потім обробляє крайній випадок, коли саме округлення доходить до наступної одиниці. У сучасному Angular pipe була б `standalone: true` (за замовчуванням з v19) й імпортувалася б напряму компонентами, що її використовують.",
    ],
  }),
  practice({
    slug: "ng-hierarchical-di",
    skills: ["angular", w("design-patterns")],
    complexity: 3,
    estSeconds: 1080,
    framework: "angular",
    title: ["Hierarchical injectors and injection tokens", "Ієрархічні інжектори й токени впровадження"],
    prompt: [
      "Three `app-counter`s share one `CounterService`, so clicking one changes them all, and the step is hard-coded. Fix the providers:\n\n- Each `app-counter` gets **its own** `CounterService`.\n- The step comes from the `COUNTER_STEP` injection token (in `tokens.ts`), provided as `1` for the whole app.\n- Counters placed **inside** `<app-fast-zone>` count in steps of `10`: override the token in `FastZoneComponent`.\n- `ClickLogger` stays a single app-wide instance, so \"Total clicks\" counts clicks on every counter.\n\nYou only need to change providers and constructor parameters, not the templates. " + NOTE_EN,
      "Три `app-counter` ділять один `CounterService`, тож натискання на один змінює всі, а крок жорстко прописано. Виправте провайдерів:\n\n- Кожен `app-counter` отримує **власний** `CounterService`.\n- Крок береться з токена впровадження `COUNTER_STEP` (у `tokens.ts`), наданого як `1` для всього застосунку.\n- Лічильники, розміщені **всередині** `<app-fast-zone>`, рахують із кроком `10`: перевизначте токен у `FastZoneComponent`.\n- `ClickLogger` лишається єдиним екземпляром на весь застосунок, тож «Total clicks» рахує натискання на всіх лічильниках.\n\nЗмінювати треба лише провайдерів і параметри конструкторів, а не шаблони. " + NOTE_UK,
    ],
    files: {
      "/src/app/counter.service.ts": DI_SERVICE_STARTER,
      "/src/app/counter.component.ts": DI_COUNTER_STARTER,
      "/src/app/fast-zone.component.ts": DI_FAST_STARTER,
      "/src/app/app.module.ts": DI_MODULE_STARTER,
      "/src/app/tokens.ts": DI_TOKENS,
      "/src/app/click-logger.service.ts": DI_LOGGER,
      "/src/app/app.component.ts": DI_APP,
    },
    visibleFiles: [
      "/src/app/counter.service.ts",
      "/src/app/counter.component.ts",
      "/src/app/fast-zone.component.ts",
      "/src/app/app.module.ts",
      "/src/app/tokens.ts",
      "/src/app/app.component.ts",
    ],
    activeFile: "/src/app/counter.service.ts",
    tests: DI_TESTS,
    solution: {
      "/src/app/counter.service.ts": DI_SERVICE_SOLUTION,
      "/src/app/counter.component.ts": DI_COUNTER_SOLUTION,
      "/src/app/fast-zone.component.ts": DI_FAST_SOLUTION,
      "/src/app/app.module.ts": DI_MODULE_SOLUTION,
    },
    explanation: [
      "Angular resolves a dependency by walking up the **element injector** tree (component and directive `providers` along the template hierarchy) and then the module/root injector. `providedIn: 'root'` creates one app-wide singleton, which is right for `ClickLogger` and wrong for per-counter state; listing `CounterService` in the component's `providers` gives every `app-counter` its own instance. An `InjectionToken` provides non-class values like numbers or configuration, injected with `@Inject(COUNTER_STEP)`. Because projected content resolves its injector from where it sits in the template, a component's `providers` (unlike `viewProviders`) are visible to the content placed inside it, which is how `app-fast-zone` overrides the step for its children. In modern Angular you'd write `private step = inject(COUNTER_STEP)` instead of constructor parameters; the injector hierarchy is the same.",
      "Angular знаходить залежність, ідучи вгору деревом **інжекторів елементів** (`providers` компонентів і директив уздовж ієрархії шаблонів), а потім інжектором модуля/кореня. `providedIn: 'root'` створює один синглтон на весь застосунок, що правильно для `ClickLogger` і неправильно для стану окремого лічильника; перелік `CounterService` у `providers` компонента дає кожному `app-counter` власний екземпляр. `InjectionToken` надає значення, що не є класами, як-от числа чи конфігурацію, і впроваджується через `@Inject(COUNTER_STEP)`. Оскільки спроєктований вміст знаходить свій інжектор за місцем у шаблоні, `providers` компонента (на відміну від `viewProviders`) видимі для вмісту, розміщеного всередині нього, і саме так `app-fast-zone` перевизначає крок для своїх дочірніх елементів. У сучасному Angular замість параметрів конструктора пишуть `private step = inject(COUNTER_STEP)`; ієрархія інжекторів та сама.",
    ],
  }),
  practice({
    slug: "ng-signup-reactive-form",
    skills: ["angular", w("rxjs"), w("web-accessibility", 0.3)],
    complexity: 4,
    estSeconds: 1800,
    framework: "angular",
    dependencies: FORMS_DEPS,
    title: ["A reactive signup form with custom and async validators", "Реактивна форма реєстрації з власними й асинхронними валідаторами"],
    prompt: [
      "Finish `SignupComponent` (Reactive Forms):\n\n- **username**: required, at least 3 characters, and **available**. Use an async validator that waits 300 ms, then asks `UsernameService.isTaken` (\"admin\" and \"root\" are taken).\n- **email**: required, valid email.\n- **password**: required, at least 8 characters, and must contain a digit (a custom validator).\n- **confirm**: required, and must equal the password. This is a **group-level** validator, with the error shown under the confirm field.\n- `errorFor(field)` returns the message to show, only once the field is dirty or touched: `Username is required`, `At least N characters`, `Username is taken`, `Enter a valid email`, `Include a number`, `Passwords don't match` (for empty fields: `Email is required`, `Password is required`, `Please confirm your password`).\n- **Create account** is disabled while the form is invalid **or pending**. Submitting emits only `{ username, email }` (never passwords) and resets the form.\n\n" + NOTE_EN,
      "Завершіть `SignupComponent` (Reactive Forms):\n\n- **username**: обов'язкове, щонайменше 3 символи і **вільне**. Використайте асинхронний валідатор, що чекає 300 мс, а потім питає `UsernameService.isTaken` (\"admin\" і \"root\" зайняті).\n- **email**: обов'язкове, коректна адреса.\n- **password**: обов'язкове, щонайменше 8 символів і має містити цифру (власний валідатор).\n- **confirm**: обов'язкове й має дорівнювати паролю. Це валідатор **рівня групи**, а помилка показується під полем confirm.\n- `errorFor(field)` повертає повідомлення для показу, лише коли поле змінено (dirty) чи торкнуто (touched): `Username is required`, `At least N characters`, `Username is taken`, `Enter a valid email`, `Include a number`, `Passwords don't match` (для порожніх полів: `Email is required`, `Password is required`, `Please confirm your password`).\n- **Create account** вимкнено, поки форма некоректна **або очікує** (pending). Надсилання видає лише `{ username, email }` (ніколи не паролі) і скидає форму.\n\n" + NOTE_UK,
    ],
    files: {
      "/src/app/signup.component.ts": filled(SIGNUP_STARTER),
      "/src/app/username.service.ts": USERNAME_SERVICE,
      "/src/app/app.component.ts": SIGNUP_APP,
      "/src/app/app.module.ts": SIGNUP_MODULE,
    },
    visibleFiles: ["/src/app/signup.component.ts", "/src/app/username.service.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/signup.component.ts",
    tests: SIGNUP_TESTS,
    solution: { "/src/app/signup.component.ts": filled(SIGNUP_SOLUTION) },
    explanation: [
      "Reactive forms describe the form in code: `FormBuilder.group` takes, for each control, `[initial value, sync validators, async validators]`, plus options for the group. Validators are plain functions returning `null` or an error map, so `hasDigit` and the cross-field `passwordsMatch` (on the **group**, because it needs two controls) are easy to write and test. Async validators run only after the sync ones pass, and Angular unsubscribes from the previous run on every keystroke, so a `timer(300)` inside works as a debounce. While one is running the form is `pending`, which the submit button must respect. Showing errors only after `dirty || touched` avoids shouting at users who haven't typed yet. In modern Angular the same form is typed (`FormGroup<{ username: FormControl<string> … }>`), and the new Signal Forms API builds on the same validator ideas.",
      "Реактивні форми описують форму в коді: `FormBuilder.group` приймає для кожного елемента керування `[початкове значення, синхронні валідатори, асинхронні валідатори]` плюс параметри для групи. Валідатори є звичайними функціями, що повертають `null` чи мапу помилок, тож `hasDigit` і міжпольовий `passwordsMatch` (на **групі**, бо йому потрібні два елементи) легко писати й тестувати. Асинхронні валідатори виконуються лише після проходження синхронних, а Angular відписується від попереднього запуску на кожне натискання клавіші, тож `timer(300)` усередині працює як debounce. Поки такий валідатор виконується, форма перебуває в стані `pending`, і кнопка надсилання має це враховувати. Показ помилок лише після `dirty || touched` не кричить на користувачів, які ще нічого не ввели. У сучасному Angular та сама форма типізована (`FormGroup<{ username: FormControl<string> … }>`), а новий API Signal Forms спирається на ті самі ідеї валідаторів.",
    ],
  }),
  practice({
    slug: "ng-rating-control-value-accessor",
    skills: ["angular", w("web-accessibility"), w("design-patterns", 0.3)],
    complexity: 4,
    estSeconds: 1320,
    framework: "angular",
    dependencies: FORMS_DEPS,
    title: ["A custom form control: ControlValueAccessor", "Власний елемент форми: ControlValueAccessor"],
    prompt: [
      "`<app-rating formControlName=\"rating\">` renders five star buttons but isn't connected to the form. Implement `ControlValueAccessor` in `RatingComponent`:\n\n- `writeValue`: show the value the form sets (initially 3; the **Set to 2** button sets it later). `null` means 0.\n- Clicking a star updates the form control (`registerOnChange`) and marks it **touched** (`registerOnTouched`).\n- `setDisabledState`: disabling the control disables every star, and enabling it again re-enables them.\n- Keyboard: `ArrowRight` and `ArrowLeft` (while focus is inside the component) raise and lower the rating, staying between 1 and 5.\n\nEach star keeps its `aria-label` (\"Rate 3\") and `aria-pressed` state. " + NOTE_EN,
      "`<app-rating formControlName=\"rating\">` рендерить п'ять кнопок-зірок, але не пов'язаний з формою. Реалізуйте `ControlValueAccessor` у `RatingComponent`:\n\n- `writeValue`: показуйте значення, яке встановлює форма (спершу 3; пізніше кнопка **Set to 2** встановлює 2). `null` означає 0.\n- Натискання на зірку оновлює елемент форми (`registerOnChange`) і позначає його як **touched** (`registerOnTouched`).\n- `setDisabledState`: вимкнення елемента вимикає всі зірки, а повторне ввімкнення знову їх вмикає.\n- Клавіатура: `ArrowRight` і `ArrowLeft` (коли фокус усередині компонента) підвищують і знижують оцінку в межах від 1 до 5.\n\nКожна зірка зберігає свій `aria-label` («Rate 3») і стан `aria-pressed`. " + NOTE_UK,
    ],
    files: {
      "/src/app/rating.component.ts": filled(RATING_STARTER),
      "/src/app/app.component.ts": RATING_APP,
      "/src/app/app.module.ts": RATING_MODULE,
    },
    visibleFiles: ["/src/app/rating.component.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/rating.component.ts",
    tests: RATING_TESTS,
    solution: { "/src/app/rating.component.ts": filled(RATING_SOLUTION) },
    explanation: [
      "`ControlValueAccessor` is the bridge between the forms API and any UI: the `NG_VALUE_ACCESSOR` provider (with `useExisting` and `forwardRef`, because the class is referenced inside its own decorator) tells `formControlName` to talk to this component instead of a native input. Data flows both ways through four methods: `writeValue` (model → view), the callbacks saved from `registerOnChange` and `registerOnTouched` (view → model), and `setDisabledState`. Because the component implements the contract, it works with reactive forms, template-driven `ngModel`, validators and `touched`/`dirty` state for free. The same pattern still applies in current Angular, and the newer signal-based `model()` inputs cover simpler two-way bindings that don't need the forms API.",
      "`ControlValueAccessor` є мостом між API форм і будь-яким інтерфейсом: провайдер `NG_VALUE_ACCESSOR` (з `useExisting` і `forwardRef`, бо клас згадується у власному декораторі) каже `formControlName` спілкуватися з цим компонентом замість нативного поля введення. Дані йдуть в обидва боки через чотири методи: `writeValue` (модель → подання), колбеки, збережені з `registerOnChange` і `registerOnTouched` (подання → модель), і `setDisabledState`. Оскільки компонент реалізує цей контракт, він безкоштовно працює з реактивними формами, `ngModel` з шаблонних форм, валідаторами й станом `touched`/`dirty`. Той самий шаблон досі діє в сучасному Angular, а новіші вхідні дані-сигнали `model()` покривають простіші двосторонні прив'язки, яким не потрібен API форм.",
    ],
  }),
  practice({
    slug: "ng-rxjs-typeahead",
    skills: ["angular", w("rxjs"), w("async-cancellation")],
    complexity: 4,
    estSeconds: 1500,
    framework: "angular",
    title: ["A typeahead with RxJS operators", "Пошук із підказками на операторах RxJS"],
    prompt: [
      "`SearchComponent` fires a request on every keystroke and can show stale results. Rebuild its stream in `ngOnInit`:\n\n- Wait until typing pauses for **250 ms**, and trim the term.\n- Terms shorter than 2 characters don't hit the service: clear the results and show `Type at least 2 characters`.\n- Don't search again for the same term (`\"react \"` after `\"react\"` is the same search).\n- A slower, older response must **never** overwrite a newer one: the service answers `\"re\"` very slowly.\n- `status` shows `Searching…` while waiting, then `N results` or `No results`.\n- Unsubscribe when the component is destroyed.\n\nThe page shows every request the service received, so extra requests fail the tests. " + NOTE_EN,
      "`SearchComponent` надсилає запит на кожне натискання клавіші й може показувати застарілі результати. Перебудуйте його потік у `ngOnInit`:\n\n- Чекайте, доки набір призупиниться на **250 мс**, і обрізайте пробіли в терміні.\n- Терміни, коротші за 2 символи, не доходять до сервісу: очищуйте результати й показуйте `Type at least 2 characters`.\n- Не шукайте повторно той самий термін (`\"react \"` після `\"react\"` є тим самим пошуком).\n- Повільніша, старіша відповідь **ніколи** не повинна перезаписати новішу: сервіс відповідає на `\"re\"` дуже повільно.\n- `status` показує `Searching…` під час очікування, а потім `N results` чи `No results`.\n- Відписуйтеся, коли компонент знищено.\n\nСторінка показує кожен запит, який отримав сервіс, тож зайві запити провалюють тести. " + NOTE_UK,
    ],
    files: {
      "/src/app/search.component.ts": filled(SEARCH_STARTER),
      "/src/app/search.service.ts": SEARCH_SERVICE,
      "/src/app/app.component.ts": SEARCH_APP,
      "/src/app/app.module.ts": SEARCH_MODULE,
    },
    visibleFiles: ["/src/app/search.component.ts", "/src/app/search.service.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/search.component.ts",
    tests: SEARCH_TESTS,
    solution: { "/src/app/search.component.ts": filled(SEARCH_SOLUTION) },
    explanation: [
      "Each requirement maps to an operator: `debounceTime` waits for a pause, `map(trim)` plus `distinctUntilChanged` drops repeats, and `switchMap` is the key one. When a new term arrives it **unsubscribes** from the previous inner observable, so a slow, stale response is discarded instead of overwriting newer results (`mergeMap` would let them race, and `concatMap` would queue them). Short terms map to `of([])` inside the same `switchMap`, which also cancels any request in flight. Collecting subscriptions in a `Subscription` and unsubscribing in `ngOnDestroy` prevents leaks; with the `async` pipe or, in modern Angular, `toSignal(...)` and `takeUntilDestroyed()`, that cleanup happens automatically.",
      "Кожна вимога відповідає оператору: `debounceTime` чекає паузи, `map(trim)` разом із `distinctUntilChanged` відкидає повтори, а ключовим є `switchMap`. Коли надходить новий термін, він **відписується** від попереднього внутрішнього observable, тож повільна застаріла відповідь відкидається, а не перезаписує новіші результати (`mergeMap` дав би їм змагатися, а `concatMap` поставив би їх у чергу). Короткі терміни перетворюються на `of([])` у тому самому `switchMap`, що також скасовує будь-який поточний запит. Збирання підписок в `Subscription` і відписка в `ngOnDestroy` запобігають витокам; з pipe `async` або, в сучасному Angular, з `toSignal(...)` і `takeUntilDestroyed()` це очищення відбувається автоматично.",
    ],
  }),
  practice({
    slug: "ng-onpush-immutable",
    skills: ["angular", w("immutability-copying"), w("web-performance", 0.3)],
    complexity: 3,
    estSeconds: 1080,
    framework: "angular",
    title: ["OnPush change detection and immutable updates", "Виявлення змін OnPush і незмінні оновлення"],
    prompt: [
      "`TodoListComponent` uses `ChangeDetectionStrategy.OnPush`, and the parent `AppComponent` mutates its `todos` array, so new todos and **Complete all** don't show up in the list.\n\n- Change `AppComponent` so every update (`add`, `toggle`, `completeAll`) produces a **new array**, creating new objects only for the todos that actually change.\n- Add a `trackBy` to the list's `*ngFor`, so a toggled todo keeps its existing `<li>` element instead of being re-created.\n\nDon't remove `OnPush`. " + NOTE_EN,
      "`TodoListComponent` використовує `ChangeDetectionStrategy.OnPush`, а батьківський `AppComponent` змінює свій масив `todos` на місці, тож нові справи й **Complete all** не з'являються в списку.\n\n- Змініть `AppComponent` так, щоб кожне оновлення (`add`, `toggle`, `completeAll`) створювало **новий масив**, а нові об'єкти лише для справ, що справді змінюються.\n- Додайте `trackBy` до `*ngFor` у списку, щоб перемкнута справа зберігала свій наявний елемент `<li>`, а не створювалася заново.\n\nНе прибирайте `OnPush`. " + NOTE_UK,
    ],
    files: {
      "/src/app/app.component.ts": filled(TODO_APP_STARTER),
      "/src/app/todo-list.component.ts": TODO_LIST_STARTER,
      "/src/app/todo.ts": TODO_TYPES,
      "/src/app/app.module.ts": TODO_MODULE,
    },
    visibleFiles: ["/src/app/app.component.ts", "/src/app/todo-list.component.ts", "/src/app/todo.ts"],
    activeFile: "/src/app/app.component.ts",
    tests: TODO_TESTS,
    solution: {
      "/src/app/app.component.ts": filled(TODO_APP_SOLUTION),
      "/src/app/todo-list.component.ts": TODO_LIST_SOLUTION,
    },
    explanation: [
      "An `OnPush` component is checked only when one of its `@Input` **references** changes, an event fires inside it, an `async` pipe emits, or it's explicitly marked for check. Pushing into the same array or flipping `done` on the same object changes nothing Angular compares, so the list stays stale (toggling from inside the child still works, because the child's own event marks it dirty). Immutable updates (`[...todos, newTodo]`, `map` returning `{ ...todo, done }` only for changed items) give the child new references, and unchanged objects keep their identity. `trackBy: trackById` then tells `ngFor` that a replaced object is the same row, so it updates the existing `<li>` instead of destroying and recreating it. In modern Angular, signals give the same precision (`todos = signal<Todo[]>([])` with `update(...)`), and `@for (todo of todos(); track todo.id)` makes tracking mandatory.",
      "Компонент `OnPush` перевіряється, лише коли змінюється **посилання** в одному з його `@Input`, усередині нього спрацьовує подія, pipe `async` видає значення, або його явно позначено для перевірки. Додавання в той самий масив чи перемикання `done` в тому самому об'єкті не змінює нічого, що порівнює Angular, тож список лишається застарілим (перемикання зсередини дочірнього компонента все одно працює, бо власна подія позначає його брудним). Незмінні оновлення (`[...todos, newTodo]`, `map`, що повертає `{ ...todo, done }` лише для змінених елементів) дають дочірньому компоненту нові посилання, а незмінені об'єкти зберігають свою ідентичність. `trackBy: trackById` потім каже `ngFor`, що замінений об'єкт є тим самим рядком, тож він оновлює наявний `<li>`, а не знищує й не створює його заново. У сучасному Angular таку саму точність дають сигнали (`todos = signal<Todo[]>([])` з `update(...)`), а `@for (todo of todos(); track todo.id)` робить відстеження обов'язковим.",
    ],
  }),
  practice({
    slug: "ng-tabs-content-children",
    skills: ["angular", w("web-accessibility"), w("design-patterns", 0.3)],
    complexity: 4,
    estSeconds: 1500,
    framework: "angular",
    title: ["Tabs: content projection and @ContentChildren", "Вкладки: проєкція вмісту й @ContentChildren"],
    prompt: [
      "Build `<app-tabs>` and `<app-tab title=\"…\">` in `tabs.component.ts`, used as `<app-tabs><app-tab title=\"Overview\">…</app-tab>…</app-tabs>`:\n\n- `app-tabs` renders a `role=\"tablist\"` with a `role=\"tab\"` button for each `app-tab` placed inside it (use `@ContentChildren`), then the projected tabs.\n- The first tab is active by default. Only the active tab's content is rendered, inside a `role=\"tabpanel\"`.\n- Clicking a tab selects it, updates `aria-selected`, and emits its title through `selectedChange`.\n- Tabs can appear and disappear (one is behind `*ngIf`). If the active tab is removed, the first tab becomes active.\n- `ArrowRight`/`ArrowLeft` inside the tablist move the selection, wrapping around.\n\nTip: let each `app-tab` inject its parent `TabsComponent` and ask whether it's active, instead of the parent pushing state into the children. " + NOTE_EN,
      "Побудуйте `<app-tabs>` і `<app-tab title=\"…\">` у `tabs.component.ts`, що використовуються як `<app-tabs><app-tab title=\"Overview\">…</app-tab>…</app-tabs>`:\n\n- `app-tabs` рендерить `role=\"tablist\"` з кнопкою `role=\"tab\"` для кожного `app-tab`, розміщеного всередині (використайте `@ContentChildren`), а потім спроєктовані вкладки.\n- Перша вкладка активна за замовчуванням. Рендериться лише вміст активної вкладки, усередині `role=\"tabpanel\"`.\n- Натискання на вкладку вибирає її, оновлює `aria-selected` і видає її заголовок через `selectedChange`.\n- Вкладки можуть з'являтися й зникати (одна прихована за `*ngIf`). Якщо активну вкладку видалено, активною стає перша.\n- `ArrowRight`/`ArrowLeft` усередині tablist переміщують вибір по колу.\n\nПорада: нехай кожен `app-tab` впроваджує свого батька `TabsComponent` і питає, чи він активний, а не батько записує стан у дочірні компоненти. " + NOTE_UK,
    ],
    files: {
      "/src/app/tabs.component.ts": TABS_STARTER,
      "/src/app/app.component.ts": TABS_APP,
      "/src/app/app.module.ts": TABS_MODULE,
    },
    visibleFiles: ["/src/app/tabs.component.ts", "/src/app/app.component.ts"],
    activeFile: "/src/app/tabs.component.ts",
    tests: TABS_TESTS,
    solution: { "/src/app/tabs.component.ts": TABS_SOLUTION },
    explanation: [
      "`<ng-content>` projects the `app-tab` elements the parent template placed inside `app-tabs`, and `@ContentChildren(TabComponent)` gives a live `QueryList` of them, which updates when an `*ngIf` adds or removes a tab, so `*ngFor` over it renders the buttons. Instead of storing an `active` flag in every child (which means pushing state down during change detection and risking `ExpressionChangedAfterItHasBeenChecked` errors), each `TabComponent` injects its parent `TabsComponent` through the element injector and **derives** `active` from the parent's `activeTab` getter. That getter also implements the fallback: if the selected tab is gone, the first tab wins. Roving `tabindex` and arrow keys follow the WAI-ARIA tabs pattern. In modern Angular this would be `contentChildren(TabComponent)` (a signal) and `computed()` for the active tab, with the same design.",
      "`<ng-content>` проєктує елементи `app-tab`, які батьківський шаблон розмістив усередині `app-tabs`, а `@ContentChildren(TabComponent)` дає живий `QueryList` цих елементів, що оновлюється, коли `*ngIf` додає чи прибирає вкладку, тож `*ngFor` по ньому рендерить кнопки. Замість зберігати прапорець `active` у кожному дочірньому компоненті (а це означає записувати стан униз під час виявлення змін і ризикувати помилками `ExpressionChangedAfterItHasBeenChecked`), кожен `TabComponent` впроваджує свого батька `TabsComponent` через інжектор елемента й **обчислює** `active` із гетера `activeTab` батька. Цей гетер також реалізує запасний варіант: якщо вибраної вкладки немає, перемагає перша. Рухомий `tabindex` і клавіші-стрілки відповідають шаблону вкладок WAI-ARIA. У сучасному Angular це був би `contentChildren(TabComponent)` (сигнал) і `computed()` для активної вкладки, з тим самим дизайном.",
    ],
  }),
]);
