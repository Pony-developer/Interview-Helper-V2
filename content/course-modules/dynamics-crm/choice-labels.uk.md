Стовпець choice зберігає число, але люди думають мітками. Перетворюйте одне на інше, як це робить код, коли показує значення в повідомленні чи читає мітку з файлу імпорту.

Програма має метадані стовпця choice `contoso_tier`: список об'єктів `ChoiceOption`, кожен із `Value` і `Label`.

Напишіть два методи в `Choices`:

- `Label(choice, value)`: мітка для `OptionSetValue`.
  - `null` (стовпець порожній) → `(empty)`
  - значення, якого немає в списку (видалений варіант) → `Unknown (<value>)`
- `Parse(choice, label)`: `OptionSetValue` для мітки, введеної людиною.
  - Ігноруйте пробіли навколо мітки та регістр літер.
  - Повертайте `null`, коли мітка `null` або не знайдена.

Не змінюйте `Main`. Очікуваний результат:

```text
Label(null) = (empty)
Label(100000001) = Silver
Label(100000007) = Unknown (100000007)
Parse("gold") = 100000002
Parse(" Silver ") = 100000001
Parse("Platinum") = not found
Parse(null) = not found
```

Підказка: `choice.Options.FirstOrDefault(o => o.Value == value.Value)` знаходить варіант або повертає `null`. `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` порівнює мітки без огляду на регістр.
