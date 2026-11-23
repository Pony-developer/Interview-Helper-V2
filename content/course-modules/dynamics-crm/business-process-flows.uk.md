**Business process flows** (BPF) ведуть користувачів через етапи (Qualify → Develop → Propose → Close) з кроками, які треба виконати на кожному. Їх налаштовують без коду, але Client API дає скриптам читати процес, реагувати на зміну етапу й блокувати неготові переходи.

## API процесу

```javascript
const process = formContext.data.process;

const active = process.getActiveProcess();        // { getId(), getName(), getStages() }
const stage = process.getActiveStage();           // { getId(), getName(), getStatus(), getSteps() }
const selected = process.getSelectedStage();      // етап, на який клацнув користувач (може відрізнятися)
const path = process.getActivePath();             // етапи поточної гілки

process.moveNext(result => {                      // "success", "crossEntity", "end", "invalid", "dirtyForm"…
  if (result !== "success") Xrm.Navigation.openAlertDialog({ text: "Could not move: " + result });
});
process.movePrevious(result => { /* ті самі результати */ });
process.setActiveStage(stageId);
process.setStatus("finished");                    // "active" | "aborted" | "finished"
```

Зміна етапу зберігає екземпляр BPF; спершу переконайтеся, що на формі немає незбережених некоректних даних.

## Реакція та блокування

```javascript
function onLoad(executionContext) {
  const fc = executionContext.getFormContext();
  fc.data.process.addOnPreStageChange(beforeStageChange);
  fc.data.process.addOnStageChange(afterStageChange);
  fc.data.process.addOnStageSelected(stageSelected);
}

function beforeStageChange(executionContext) {
  const args = executionContext.getEventArgs();
  const fc = executionContext.getFormContext();
  if (args.getDirection() === "Next" && !fc.getAttribute("contoso_budgetapproved").getValue()) {
    args.preventDefault();
    Xrm.Navigation.openAlertDialog({ text: "Approve the budget before moving on." });
  }
}

function afterStageChange(executionContext) {
  const stage = executionContext.getEventArgs().getStage();
  const fc = executionContext.getFormContext();
  fc.ui.tabs.get("tab_proposal").setVisible(stage.getName() === "Propose");
}
```

- **`addOnPreStageChange`** виконується *перед* переходом і може скасувати його через `preventDefault()`; `getDirection()` повертає `"Next"` чи `"Previous"`.
- **`addOnStageChange`** виконується *після* переходу; використовуйте його, щоб пристосувати форму до нового етапу.
- **`addOnStageSelected`** виконується, коли користувач клацає етап, щоб переглянути його, без переходу.
- **`addOnProcessStatusChange`** виконується, коли процес завершено чи покинуто.

## Поля в панелі процесу

Кроки BPF — це контроли з іменами `header_process_<стовпець>`. Вони мають спільний атрибут із будь-якою копією в тілі форми, тож `setValue` на атрибуті оновлює обидва, але видимість і блокування задаються для кожного контролу окремо. Щоб заблокувати поле всюди, пройдіться циклом по `attribute.controls`.

## Інтерфейс процесу

`formContext.ui.process.setVisible(false)` ховає панель; `setDisplayState("collapsed" | "expanded" | "floating")` змінює спосіб її показу.

## Правила й на сервері

Перевірка перед зміною етапу — це підказка для користувачів. Якщо «Develop потребує погодженого бюджету» — жорстке правило, забезпечте його й на сервері: екземпляри BPF — це записи власної таблиці (наприклад `opportunitysalesprocess`), і плагін на їхній Update (`activestageid`) може відхилити неправильний перехід із будь-якого клієнта.

## На співбесіді

- Покажіть, як прочитати активний етап і перейти на наступний.
- Покажіть, як заблокувати зміну етапу, і поясніть, яку подію використати.
- Поясніть, як поля BPF пов'язані з атрибутами й контролами форми.
- Поясніть, як забезпечити правило етапу на сервері.
