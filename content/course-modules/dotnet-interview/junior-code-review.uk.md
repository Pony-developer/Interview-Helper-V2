Інтерв'юери часто показують короткий фрагмент і питають: «Що він робить і як би ви його покращили?» Спершу говоріть про коректність (null, граничні випадки), потім про читабельність.

## Фрагмент 1

```csharp
public bool IsArrayEmpty(string[] array)
{
    if (array.Length > 0)
        return false;
    else
        return true;
}
```

- `if (cond) return false; else return true;` — це просто `return !cond;`, тож тіло стає `return array.Length == 0;`.
- А якщо `array` дорівнює `null`? Визначте контракт: або вважати його порожнім (`return array == null || array.Length == 0;`), або кидати `ArgumentNullException`. Скажіть, що обираєте й чому.
- Метод не використовує стану екземпляра, тож може бути `static`. Для будь-якої послідовності підійде й `!items.Any()`.

## Фрагмент 2

```csharp
protected string GetClass(object url)
{
    if (SiteMap.CurrentNode.Url == url.ToString())
        return "class=\"active\"";
    return "";
}
```

- `url.ToString()` кидає `NullReferenceException`, якщо `url` дорівнює null, а `SiteMap.CurrentNode` дорівнює null для сторінок поза мапою сайту.
- Параметр має тип `object` без жодної причини: приймайте `string`.
- URL, мабуть, слід порівнювати без урахування регістру: `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)`.
- Повертати сирий HTML-атрибут — значить змішувати логіку й розмітку: поверніть `bool`, а рішення залиште поданню.

```csharp
protected bool IsCurrent(string url) =>
    SiteMap.CurrentNode != null &&
    string.Equals(SiteMap.CurrentNode.Url, url, StringComparison.OrdinalIgnoreCase);
```

## Задачі на проєктування без коду

- **Калькулятор**: розділіть розбір (токенізатор), обчислення (пріоритет операторів через алгоритм сортувальної станції або рекурсивний спуск) і форматування. Тоді римські числа лише додають новий парсер і форматер чисел за інтерфейсом; обчислювач лишається тим самим (принцип відкритості/закритості). Саме це ви зробите в другій практиці.
- **Структура папок**: патерн Composite. Абстрактний `FileSystemEntry` має `Name` і `Size`; `File` знає свій розмір; `Folder` містить `List<FileSystemEntry>` і рекурсивно обчислює свій розмір. Ви збудуєте його в практиці «Дерево папок».

Дві наступні практики: прості числа (перебір дільників, решето й розклад на множники) та римський калькулятор.
