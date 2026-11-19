import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "rx-vs-promise",
    ["rxjs"],
    1,
    60,
    ["Observable vs Promise", "Observable проти Promise"],
    ["Which statement about Observables compared with Promises is true?", "Яке твердження про Observable порівняно з Promise правдиве?"],
    [
      ["An Observable can emit many values over time and does nothing until subscribed", "Observable може випромінювати багато значень із часом і нічого не робить до підписки"],
      ["An Observable always emits exactly one value", "Observable завжди випромінює рівно одне значення"],
      ["Promises can be cancelled with `unsubscribe()`", "Проміси можна скасувати через `unsubscribe()`"],
      ["Observables start running as soon as they are created", "Observable починають працювати одразу після створення"],
    ],
    "a",
    [
      "A Promise represents a single future value and starts its work immediately (eager). A typical (cold) Observable is lazy, runs once per subscriber, can emit zero to many values, and can be torn down with `unsubscribe()`. That makes it a good fit for events, streams and cancellable requests.",
      "Promise представляє одне майбутнє значення й починає роботу одразу (енергійно). Типовий (холодний) Observable лінивий, виконується окремо для кожного підписника, може випромінити від нуля до багатьох значень і зупиняється через `unsubscribe()`. Тож він добре підходить для подій, потоків і запитів, які можна скасувати.",
    ],
  ),
  quiz(
    "rx-share-replay",
    ["rxjs"],
    4,
    90,
    ["Sharing an HTTP result", "Спільний результат HTTP"],
    ["Three components subscribe to `config$` at different times. The request should run once, late subscribers should get the last value, and the source should be released when nobody is subscribed. Which operator fits best?", "Три компоненти підписуються на `config$` у різний час. Запит має виконатися один раз, пізні підписники мають отримати останнє значення, а джерело має звільнятися, коли підписників немає. Який оператор підходить найкраще?"],
    [
      ["`share()`", "`share()`"],
      ["`shareReplay({ bufferSize: 1, refCount: true })`", "`shareReplay({ bufferSize: 1, refCount: true })`"],
      ["`shareReplay(1)` with no options", "`shareReplay(1)` без параметрів"],
      ["`take(1)`", "`take(1)`"],
    ],
    "b",
    [
      "`share()` multicasts but doesn't replay, so late subscribers miss the value. `shareReplay(1)` replays, but with `refCount: false` (the default) it keeps the inner subscription alive forever, a classic leak with long-lived sources. `refCount: true` unsubscribes from the source when the last subscriber leaves. `take(1)` alone doesn't share anything.",
      "`share()` робить мультикаст, але не повторює значення, тож пізні підписники його пропускають. `shareReplay(1)` повторює, але з `refCount: false` (типово) тримає внутрішню підписку назавжди — класичний витік із довгоживучими джерелами. `refCount: true` відписується від джерела, коли йде останній підписник. Сам `take(1)` нічого не робить спільним.",
    ],
    { code: "config$ = this.http.get<Config>(\"/api/config\").pipe(/* ? */);" },
  ),
  quiz(
    "rx-switchmap-sync",
    ["rxjs"],
    5,
    120,
    ["switchMap with timers", "switchMap із таймерами"],
    ["What does this emit?", "Що це випромінить?"],
    [
      ["`1, 2, 3`", "`1, 2, 3`"],
      ["Only `3`", "Лише `3`"],
      ["Only `1`", "Лише `1`"],
      ["Nothing", "Нічого"],
    ],
    "b",
    [
      "`of(1, 2, 3)` emits all three values synchronously. Each value makes `switchMap` subscribe to a new `timer(0)` and unsubscribe from the previous one before it can fire. Only the last inner timer survives, so the output is `3`. `mergeMap` would emit `1, 2, 3`, and `exhaustMap` would emit only `1`.",
      "`of(1, 2, 3)` випромінює всі три значення синхронно. Кожне значення змушує `switchMap` підписатися на новий `timer(0)` і відписатися від попереднього, перш ніж той спрацює. Виживає лише останній внутрішній таймер, тож результат — `3`. `mergeMap` випромінив би `1, 2, 3`, а `exhaustMap` — лише `1`.",
    ],
    { code: "of(1, 2, 3)\n  .pipe(switchMap((x) => timer(0).pipe(map(() => x))))\n  .subscribe(console.log);" },
  ),
]);
