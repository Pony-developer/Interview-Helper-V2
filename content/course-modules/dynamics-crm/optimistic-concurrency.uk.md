Безпечно резервуйте товар, поки інші користувачі зберігають той самий продукт.

Програма моделює серверну частину оптимістичної конкурентності. `Store` зберігає записи з `RowVersion`, що змінюється при кожному збереженні. `Store.Update(record, behavior)` з `ConcurrencyBehavior.IfRowVersionMatches` кидає `ConcurrencyVersionMismatchException`, коли збережена версія відрізняється від `record.RowVersion`. `BeforeNextUpdate` дозволяє `Main` імітувати іншого користувача, що зберігає якраз перед вашим оновленням. Сховище вже реалізоване; не змінюйте його.

Напишіть `Inventory.Reserve(store, productId, quantity)`. Зробіть щонайбільше **3 спроби**; у кожній:

1. Прочитайте продукт і значення `new_available` (`int`).
2. Якщо воно менше за `quantity`, поверніть `Not enough stock: <available> left`.
3. Інакше надішліть оновлення, де задано **лише** `new_available = available - quantity`, з **прочитаною версією рядка** та `IfRowVersionMatches`.
4. При успіху поверніть `Reserved <quantity>, <left> left (attempt <n>)`.
5. При `ConcurrencyVersionMismatchException` почніть наступну спробу.

Після 3 конфліктів поверніть `Gave up after 3 conflicts`. Не змінюйте `Main`. Очікуваний результат:

```text
1. Reserved 2, 8 left (attempt 1)
2. Reserved 3, 3 left (attempt 2)
3. Not enough stock: 1 left
4. Gave up after 3 conflicts
Available: 20
Update calls: 7
```

Перевірте цікаві рядки: у випадку 2 інший користувач ставить залишок 6 якраз перед вашим першим збереженням, тож воно не вдається, а друга спроба читає 6 і резервує 3. З `AlwaysOverwrite` ви записали б 5 поверх його 6: втрачене оновлення. У випадку 3 повторне читання показує 1, тож нічого не зберігається. У випадку 4 хтось зберігає перед кожною спробою, тож метод здається, а не крутиться безкінечно. Ваш метод має викликати `Update` загалом 7 разів.

Підказка: для оновлення створіть новий `Record` з `Id` і `RowVersion`, скопійованими з прочитаного запису, замість того щоб відправляти назад усі його значення.
