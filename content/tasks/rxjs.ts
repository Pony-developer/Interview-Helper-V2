import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "rx-cold-http",
    ["rxjs", w("angular")],
    2,
    90,
    ["Cold observables", "Холодні observable"],
    ["A template uses `user$ | async` twice, where `user$ = http.get('/api/me')`. How many HTTP requests are made?", "Шаблон двічі використовує `user$ | async`, де `user$ = http.get('/api/me')`. Скільки HTTP-запитів буде зроблено?"],
    [
      ["One, observables are cached", "Один, observable кешуються"],
      ["Two, each subscription runs the cold observable again", "Два, кожна підписка знову запускає холодний observable"],
      ["Zero until `.toPromise()` is called", "Нуль, доки не викликано `.toPromise()`"],
      ["It depends on change detection", "Залежить від виявлення змін"],
    ],
    "b",
    [
      "HttpClient observables are cold: every subscriber triggers its own request. Share the result with `shareReplay({ bufferSize: 1, refCount: true })`, or subscribe once (e.g. `@if (user$ | async; as user)`).",
      "Observable з HttpClient холодні: кожен підписник запускає власний запит. Поділіть результат через `shareReplay({ bufferSize: 1, refCount: true })` або підпишіться один раз (наприклад, `@if (user$ | async; as user)`).",
    ],
  ),
  quiz(
    "rx-switchmap-search",
    ["rxjs"],
    2,
    90,
    ["Typeahead operator", "Оператор для пошуку"],
    ["For a search box where only the latest query's results matter, which operator should map queries to requests?", "Для поля пошуку, де важливі лише результати останнього запиту, який оператор має перетворювати запити на HTTP-запити?"],
    [
      ["`mergeMap`", "`mergeMap`"],
      ["`concatMap`", "`concatMap`"],
      ["`switchMap`", "`switchMap`"],
      ["`exhaustMap`", "`exhaustMap`"],
    ],
    "c",
    [
      "`switchMap` unsubscribes from the previous inner observable when a new value arrives, which cancels the stale request and prevents out-of-order results. `mergeMap` would let old responses overwrite new ones, `concatMap` would queue every keystroke, and `exhaustMap` would ignore new queries.",
      "`switchMap` відписується від попереднього внутрішнього observable, коли надходить нове значення: це скасовує застарілий запит і запобігає результатам не в тому порядку. `mergeMap` дозволив би старим відповідям перезаписати нові, `concatMap` ставив би в чергу кожне натискання, а `exhaustMap` ігнорував би нові запити.",
    ],
  ),
  quiz(
    "rx-exhaustmap-submit",
    ["rxjs"],
    3,
    120,
    ["Double submit", "Подвійне надсилання"],
    ["Users double-click \"Pay\" and get charged twice. Which operator on `click$` prevents a second request while the first is in flight?", "Користувачі двічі клікають «Оплатити», і з них знімають гроші двічі. Який оператор на `click$` не дасть зробити другий запит, поки триває перший?"],
    [
      ["`switchMap`", "`switchMap`"],
      ["`exhaustMap`", "`exhaustMap`"],
      ["`mergeMap`", "`mergeMap`"],
      ["`map`", "`map`"],
    ],
    "b",
    [
      "`exhaustMap` ignores source values while the inner observable is still active, so extra clicks are dropped until the payment completes. `switchMap` would cancel the first request client-side, but the server may already have processed it.",
      "`exhaustMap` ігнорує значення джерела, поки внутрішній observable ще активний, тож зайві кліки відкидаються до завершення оплати. `switchMap` скасував би перший запит на клієнті, але сервер міг уже його обробити.",
    ],
  ),
  quiz(
    "rx-behaviorsubject",
    ["rxjs", w("state-management")],
    3,
    120,
    ["Subjects", "Subject"],
    ["Which Subject gives a late subscriber the **current** value immediately, and always has one?", "Який Subject одразу дає пізньому підписнику **поточне** значення й завжди його має?"],
    [
      ["`Subject`", "`Subject`"],
      ["`BehaviorSubject`", "`BehaviorSubject`"],
      ["`AsyncSubject`", "`AsyncSubject`"],
      ["`ReplaySubject(0)`", "`ReplaySubject(0)`"],
    ],
    "b",
    [
      "BehaviorSubject requires an initial value, exposes `.value`, and emits the latest value to each new subscriber, which makes it a minimal state container. A plain Subject has no memory, and AsyncSubject emits only the last value on completion.",
      "BehaviorSubject потребує початкового значення, має `.value` і видає останнє значення кожному новому підписнику, що робить його мінімальним контейнером стану. Звичайний Subject нічого не пам'ятає, а AsyncSubject видає лише останнє значення при завершенні.",
    ],
  ),
  quiz(
    "rx-catcherror-placement",
    ["rxjs"],
    4,
    150,
    ["Where to catch errors", "Де перехоплювати помилки"],
    ["After one failed request this typeahead never searches again. Why?", "Після одного невдалого запиту цей пошук більше ніколи не шукає. Чому?"],
    [
      ["`catchError` on the outer stream replaces it with `of([])`, which completes, so the subscription ends", "`catchError` на зовнішньому потоці замінює його на `of([])`, який завершується, тож підписка закінчується"],
      ["`switchMap` can't handle errors", "`switchMap` не вміє обробляти помилки"],
      ["`debounceTime` swallows later values", "`debounceTime` поглинає пізніші значення"],
      ["HTTP errors close the input element", "HTTP-помилки закривають поле введення"],
    ],
    "a",
    [
      "An error terminates the stream it reaches. Here it reaches the outer pipeline, and `catchError` swaps the whole stream for `of([])`, which emits once and completes. Move `catchError` inside `switchMap` (`search(q).pipe(catchError(() => of([])))`) so only that inner request is replaced.",
      "Помилка завершує потік, до якого доходить. Тут вона доходить до зовнішнього конвеєра, і `catchError` замінює весь потік на `of([])`, що видає одне значення й завершується. Перенесіть `catchError` усередину `switchMap` (`search(q).pipe(catchError(() => of([])))`), щоб замінювався лише той внутрішній запит.",
    ],
    { code: "results$ = query$.pipe(\n  debounceTime(300),\n  switchMap((q) => search(q)),\n  catchError(() => of([])),\n);", codeLanguage: "ts" },
  ),
  practice({
    slug: "rx-typeahead",
    skills: ["rxjs", w("async-javascript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    dependencies: { rxjs: "7.8.1" },
    title: ["Typeahead pipeline", "Конвеєр пошуку під час введення"],
    prompt: [
      "Implement `createTypeahead(query$, search, debounceMs)` returning an `Observable<string[]>`:\n\n- Trim queries and wait `debounceMs` after the user stops typing.\n- Skip queries shorter than 2 characters and repeated identical queries.\n- Call `search(q)` (returns an Observable) and **cancel** the previous search when a new query arrives.\n- If a search errors, emit `[]` for that query and **keep working** for the next ones.",
      "Реалізуйте `createTypeahead(query$, search, debounceMs)`, що повертає `Observable<string[]>`:\n\n- Обрізайте пробіли в запитах і чекайте `debounceMs` після того, як користувач перестав друкувати.\n- Пропускайте запити коротші за 2 символи й повтори однакових запитів.\n- Викликайте `search(q)` (повертає Observable) і **скасовуйте** попередній пошук, коли надходить новий запит.\n- Якщо пошук завершився помилкою, видайте `[]` для цього запиту й **продовжуйте працювати** для наступних.",
    ],
    files: {
      "/src/typeahead.ts": 'import { Observable } from "rxjs";\nimport { map } from "rxjs/operators";\n\nexport function createTypeahead(\n  query$: Observable<string>,\n  search: (q: string) => Observable<string[]>,\n  debounceMs: number,\n): Observable<string[]> {\n  // TODO: trim, debounce, min length, distinct, switch to the latest search, recover from errors\n  return query$.pipe(map(() => []));\n}\n',
      "/index.ts": 'import "./styles.css";\nimport { fromEvent, of } from "rxjs";\nimport { delay, map } from "rxjs/operators";\nimport { createTypeahead } from "./src/typeahead";\n\nconst LANGS = ["JavaScript", "Java", "TypeScript", "Python", "Rust", "Ruby", "Go", "Kotlin"];\nconst app = document.getElementById("app")!;\napp.innerHTML = `<h1>Typeahead</h1><label for="q">Language</label> <input id="q" autocomplete="off" /><ul id="results"></ul>`;\nconst input = document.getElementById("q") as HTMLInputElement;\nconst list = document.getElementById("results")!;\n\nconst search = (q: string) => of(LANGS.filter((l) => l.toLowerCase().includes(q.toLowerCase()))).pipe(delay(150));\ncreateTypeahead(fromEvent(input, "input").pipe(map(() => input.value)), search, 250).subscribe((items) => {\n  list.innerHTML = items.map((i) => `<li>${i}</li>`).join("");\n});\n',
    },
    visibleFiles: ["/src/typeahead.ts", "/index.ts"],
    activeFile: "/src/typeahead.ts",
    tests: 'import { describe, it, expect, sleep } from "./test-kit";\nimport { Observable, Subject, of, throwError, timer } from "rxjs";\nimport { map } from "rxjs/operators";\nimport { createTypeahead } from "../src/typeahead";\n\nfunction harness(search: (q: string) => Observable<string[]>, debounceMs = 30) {\n  const query$ = new Subject<string>();\n  const results: string[][] = [];\n  const sub = createTypeahead(query$, search, debounceMs).subscribe((r) => results.push(r));\n  return { query$, results, sub };\n}\n\ndescribe("createTypeahead", () => {\n  it("debounces and searches the trimmed query", async () => {\n    const calls: string[] = [];\n    const { query$, results, sub } = harness((q) => { calls.push(q); return of([q.toUpperCase()]); });\n    query$.next("r");\n    query$.next("re");\n    query$.next(" rea ");\n    await sleep(60);\n    expect(calls).toEqual(["rea"]);\n    expect(results).toEqual([["REA"]]);\n    sub.unsubscribe();\n  });\n  it("ignores short and repeated queries", async () => {\n    const calls: string[] = [];\n    const { query$, sub } = harness((q) => { calls.push(q); return of([q]); });\n    query$.next("a");\n    await sleep(50);\n    query$.next("ab");\n    await sleep(50);\n    query$.next("ab ");\n    await sleep(50);\n    expect(calls).toEqual(["ab"]);\n    sub.unsubscribe();\n  });\n  it("cancels the previous search when a new query arrives", async () => {\n    const { query$, results, sub } = harness((q) => timer(q === "slow" ? 120 : 10).pipe(map(() => [q])), 10);\n    query$.next("slow");\n    await sleep(40);\n    query$.next("fast");\n    await sleep(200);\n    expect(results).toEqual([["fast"]]);\n    sub.unsubscribe();\n  });\n  it("recovers from a failed search", async () => {\n    const { query$, results, sub } = harness((q) => (q === "boom" ? throwError(() => new Error("500")) : of([q])), 10);\n    query$.next("boom");\n    await sleep(40);\n    query$.next("next");\n    await sleep(40);\n    expect(results).toEqual([[], ["next"]]);\n    sub.unsubscribe();\n  });\n});\n',
    solution: {
      "/src/typeahead.ts": 'import { Observable, of } from "rxjs";\nimport { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from "rxjs/operators";\n\nexport function createTypeahead(\n  query$: Observable<string>,\n  search: (q: string) => Observable<string[]>,\n  debounceMs: number,\n): Observable<string[]> {\n  return query$.pipe(\n    map((q) => q.trim()),\n    debounceTime(debounceMs),\n    filter((q) => q.length >= 2),\n    distinctUntilChanged(),\n    // switchMap cancels the previous inner search; catchError inside keeps the outer stream alive.\n    switchMap((q) => search(q).pipe(catchError(() => of([] as string[])))),\n  );\n}\n',
    },
    explanation: [
      "`map(trim)` → `debounceTime` waits for a pause → `filter` drops short queries → `distinctUntilChanged` skips repeats → `switchMap` unsubscribes from the previous search, which cancels it. `catchError` must sit inside `switchMap`: there it only replaces the failed inner search with `[]`, while the outer stream keeps listening.",
      "`map(trim)` → `debounceTime` чекає паузи → `filter` відкидає короткі запити → `distinctUntilChanged` пропускає повтори → `switchMap` відписується від попереднього пошуку й тим скасовує його. `catchError` має бути всередині `switchMap`: там він замінює на `[]` лише невдалий внутрішній пошук, а зовнішній потік продовжує слухати.",
    ],
  }),
]);
