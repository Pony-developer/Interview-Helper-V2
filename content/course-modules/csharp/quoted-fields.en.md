The CSV format stores a table as text: one record per line, with the fields separated by commas. It looks easy to read with `Split(',')`, until a field itself contains a comma. Then the field is put in **double quotes**:

```text
Ann,"Smith, Jr.",31
```

Implement `SplitCsv(line)`. It returns a `List<string>` with the fields of one line. The rules:

- Fields are separated by commas, and the **spaces are kept** as they are.
- A field that **starts with a quote** is a quoted field. It ends at the closing quote, and the commas inside it are ordinary characters.
- Inside a quoted field, two quotes in a row `""` stand for **one** quote character.
- The quotes around a field are not part of its value.
- An empty line has **one** empty field, and the line `,,` has three empty fields.

The method that is provided now simply splits on commas, so it passes only the simplest tests. `Main` prints the number of fields and the fields themselves between brackets, with `|` between them. Do not change `Main`. Expected output:

```text
3: [a|b|c]
2: [a,b|c]
2: [say "hi"|x]
3: [||]
1: []
2: [|a]
2: [ a | b ]
1: [x]
```

Hint: go through the line character by character, with a flag `inQuotes`. Collect the current field in a `StringBuilder`. A quote inside a quoted field followed by **another** quote is a literal quote (skip the second one), and otherwise it ends the quoted part. A comma outside quotes ends the field. Do not forget to add the **last** field after the loop.
