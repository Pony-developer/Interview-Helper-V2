**Простими словами:** Command перетворює **дію на об'єкт**. Щойно дія стала об'єктом, її можна зберегти, поставити в чергу, записати в журнал, виконати пізніше, повторити чи скасувати.

## Картинка з життя

Офіціант записує ваше замовлення на папірець і чіпляє його на кухні. Папірець *і є* командою: кухар може взяти його пізніше, папірці чекають у черзі, а якщо ви передумали, офіціант може забрати папірець назад.

## Проблема

Текстовий редактор має «Жирний» у меню, на панелі інструментів і на Ctrl+B. І йому потрібне скасування. Якщо меню, кнопка й гаряча клавіша кожна змінюють текст напряму, логіку скопійовано тричі, а скасовувати нічого, бо дія не залишила сліду.

## На C#

```csharp
interface ICommand
{
    void Execute();
    void Undo();
}

class RenameAccountCommand : ICommand
{
    private readonly Account account;
    private readonly string newName;
    private string oldName;

    public RenameAccountCommand(Account account, string newName) { this.account = account; this.newName = newName; }

    public void Execute() { oldName = account.Name; account.Name = newName; }
    public void Undo() { account.Name = oldName; }
}

class CommandHistory
{
    private readonly Stack<ICommand> done = new Stack<ICommand>();

    public void Run(ICommand command) { command.Execute(); done.Push(command); }
    public void UndoLast() { if (done.Count > 0) done.Pop().Undo(); }
}
```

## Де ви вже це бачите

- `ICommand` у WPF/MAUI: кнопки прив'язуються до об'єктів-команд.
- **Dynamics 365:** `service.Execute(new AssignRequest { ... })`. Кожна операція — об'єкт запиту, тож багато з них можна запакувати в `ExecuteMultipleRequest` чи `ExecuteTransactionRequest`.
- Черги фонових завдань (Hangfire, черги Azure): завдання — це серіалізована команда.
- CQRS і MediatR: `mediator.Send(new CreateOrderCommand(...))`.

## Коли застосовувати, а коли ні

- **Пасує:** скасування й повтор, черги та відкладене виконання, пакетна обробка, повторні спроби, журнал дій, та сама дія з кількох місць UI.
- **Зайве:** простий прямий виклик методу, який ніколи не потрапить у чергу і не скасовуватиметься.

## Запам'ятайте

Command = «**запит, запакований в об'єкт**»: хто, що, з якими параметрами. Усе інше (черга, скасування, журнал, пакет) випливає з цього.
