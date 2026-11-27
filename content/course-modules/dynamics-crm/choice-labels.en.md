A choice column stores a number, but people think in labels. Convert between the two, as code does when it shows a value in a message or reads a label from an import file.

The program has the metadata of a choice column `contoso_tier`: a list of `ChoiceOption` objects, each with a `Value` and a `Label`.

Write two methods in `Choices`:

- `Label(choice, value)`: the label of an `OptionSetValue`.
  - `null` (the column is empty) → `(empty)`
  - a value that is not in the list (an option that was deleted) → `Unknown (<value>)`
- `Parse(choice, label)`: the `OptionSetValue` for a label typed by a person.
  - Ignore spaces around the label and upper or lower case.
  - Return `null` when the label is `null` or not found.

Do not change `Main`. Expected output:

```text
Label(null) = (empty)
Label(100000001) = Silver
Label(100000007) = Unknown (100000007)
Parse("gold") = 100000002
Parse(" Silver ") = 100000001
Parse("Platinum") = not found
Parse(null) = not found
```

Hint: `choice.Options.FirstOrDefault(o => o.Value == value.Value)` finds an option or returns `null`. `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` compares labels without caring about case.
