Дженерики дають змогу одному методу сортування працювати для будь-якого типу, якщо тип можна порівнювати. Методу потрібні дві речі: **обмеження**, що гарантує `CompareTo`, і узагальнений допоміжний `Swap`.

```csharp
static void Swap<T>(T[] items, int i, int j)
{
    T temp = items[i];
    items[i] = items[j];
    items[j] = temp;
}

static void BubbleSort<T>(T[] items) where T : IComparable<T>
{
    for (int pass = 0; pass < items.Length - 1; pass++)
    {
        for (int i = 0; i < items.Length - 1 - pass; i++)
        {
            if (items[i].CompareTo(items[i + 1]) > 0)
            {
                Swap(items, i, i + 1);
            }
        }
    }
}

int[] numbers = { 5, 2, 9, 1 };
BubbleSort(numbers);                       // 1 2 5 9

string[] words = { "pear", "apple", "plum" };
BubbleSort(words);                         // apple pear plum
```

Той самий код сортує цілі числа й рядки. Компілятор створює правильну версію для кожного типу, а `Swap` взагалі не потребує обмеження, бо лише переставляє значення.

## Обмеження — це контракт

Без `where T : IComparable<T>` виклик `items[i].CompareTo(...)` не компілюється. Обмеження каже: «`T` обіцяє бути порівнюваним». Будь-який тип, що дотримує цієї обіцянки, можна сортувати, зокрема ваші власні класи.

## Вбудоване сортування

На практиці `Array.Sort` і `List<T>.Sort` теж узагальнені й швидші. Вживайте їх у реальному коді; власне сортування пишіть, щоб зрозуміти, як працюють узагальнені алгоритми.
