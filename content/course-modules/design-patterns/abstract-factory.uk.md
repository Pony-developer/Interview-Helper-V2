**Простими словами:** абстрактна фабрика створює **цілу родину об'єктів, що пасують одне до одного**. Ви вибираєте родину один раз, і кожен отриманий з неї об'єкт поєднується з іншими.

## Картинка з життя

Меблеві магазини продають комплекти: комплект «Модерн» має сучасні стілець, стіл і диван; комплект «Класика» — класичні. Ви вибираєте стиль один раз і ніколи не отримаєте бароковий стілець поруч зі скляним столом.

## Проблема

Застосунок підтримує світлу й темну теми. Кожна тема має власні кнопку, прапорець і діалог. Якщо код створює їх по одному з `if (dark)`, рано чи пізно хтось створить світлу кнопку в темному діалозі.

## На C#

```csharp
interface IUiFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

class LightUiFactory : IUiFactory
{
    public IButton CreateButton() { return new LightButton(); }
    public ICheckbox CreateCheckbox() { return new LightCheckbox(); }
}

class DarkUiFactory : IUiFactory
{
    public IButton CreateButton() { return new DarkButton(); }
    public ICheckbox CreateCheckbox() { return new DarkCheckbox(); }
}

// Екран отримує фабрику один раз і більше не думає про теми
class SettingsScreen
{
    public SettingsScreen(IUiFactory ui)
    {
        var save = ui.CreateButton();
        var notifications = ui.CreateCheckbox();
    }
}
```

## Реальний backend-приклад

Інтеграція працює з «тестовим середовищем» або «продакшном». Кожному потрібні свій HTTP-клієнт, своє сховище й своя черга повідомлень. `IEnvironmentFactory` з `TestEnvironmentFactory` і `ProductionEnvironmentFactory` унеможливлює змішати тестову чергу з робочим сховищем.

## Factory проти Abstract Factory

| | Factory / Factory Method | Abstract Factory |
| --- | --- | --- |
| Створює | **один** вид продукту | **родину** пов'язаних продуктів |
| Типова форма | один метод `Create(...)` | інтерфейс із кількома методами `CreateX()` |

## Коли застосовувати, а коли ні

- **Пасує:** кілька пов'язаних об'єктів мають завжди походити з одного «комплекту».
- **Зайве:** продукт лише один або родина ніколи не змінюється.

## Запам'ятайте

Abstract Factory = «фабрика узгоджених комплектів». Замініть один об'єкт фабрики — і вся родина зміниться одразу.
