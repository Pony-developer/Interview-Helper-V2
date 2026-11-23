A CSV line holds fields separated by commas. A field may be in **double quotes** so that it can contain commas, and two quotes inside a quoted field (`""`) stand for one quote. Write the method `static List<string> ParseLine(string line)` that splits one line into its fields. Do not use `Split`: the quotes must be handled by a character loop.

The rules:

- a comma outside quotes ends the current field;
- a quote starts or ends a quoted part; inside it, commas are ordinary characters;
- two quotes in a row inside a quoted part give one quote character;
- an empty field between two commas is an empty string, and a line that ends with a comma has an empty last field.

Do not change `Main`. Expected output:

```text
3: name | age | city
3: Ann | 30 | Kyiv
3: Smith, John | 45 | New "York"
3: Bob |  | Lviv
3: x |  | y
```

The lines in order: the header; a plain line; a line with a quoted field that contains a comma, and a quoted field with doubled quotes inside it; a line with an empty field in the middle; and a line with a quoted empty field.

Hint: keep a `StringBuilder current` for the field being built, and a `bool inQuotes`. When you meet a quote while `inQuotes` is true, look at the next character: if it is also a quote, add one quote and skip it; otherwise leave the quoted part. At the end of the line, add the last field. Remember to add `using System.Text;` if you use `StringBuilder`.
