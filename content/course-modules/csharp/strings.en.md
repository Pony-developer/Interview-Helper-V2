A `string` is a sequence of characters in double quotes. A single character is a different type, `char`, in single quotes:

```csharp
string word = "Hello";
char letter = 'H';
string empty = "";      // a string with no characters
```

## Putting strings together

`+` glues strings (**concatenation**). When one side is a string and the other is not, the other side is converted to text:

```csharp
string name = "Ann";
int age = 31;
Console.WriteLine("Name: " + name + ", age: " + age);   // Name: Ann, age: 31
```

**String interpolation** is usually clearer. Put `$` before the quote and write expressions in braces:

```csharp
Console.WriteLine($"Name: {name}, age: {age}");
Console.WriteLine($"Next year: {age + 1}");   // Next year: 32
```

Mind the order: `+` goes left to right, so the numbers are added only until the first string appears:

```csharp
Console.WriteLine(1 + 2 + "3");   // 33
Console.WriteLine("1" + 2 + 3);   // 123
```

## Escape sequences

A backslash starts a special character inside a string:

| Written | Means |
| --- | --- |
| `\n` | new line |
| `\t` | tab |
| `\"` | a double quote |
| `\\` | a backslash |

```csharp
Console.WriteLine("He said \"hi\"");   // He said "hi"
Console.WriteLine("Line 1\nLine 2");
```

A **verbatim string** `@"..."` takes backslashes literally, which is handy for paths. Inside it, a quote is written twice:

```csharp
Console.WriteLine(@"C:\temp\notes.txt");   // C:\temp\notes.txt
Console.WriteLine(@"He said ""hi""");      // He said "hi"
```

## Length and characters

Positions are counted **from zero**. `s[i]` gives the `char` at position `i`:

```csharp
string s = "Hello, World";
Console.WriteLine(s.Length);              // 12
Console.WriteLine(s[0]);                  // H
Console.WriteLine(s[s.Length - 1]);       // d, the last character
```

Reading a position that does not exist, such as `s[12]`, throws `IndexOutOfRangeException`.

## Useful methods

```csharp
s.ToUpper()                  // "HELLO, WORLD"
s.ToLower()                  // "hello, world"
"  hi  ".Trim()              // "hi"
s.Substring(7)               // "World", from position 7 to the end
s.Substring(0, 5)            // "Hello", 5 characters from position 0
s.IndexOf("World")           // 7, the position of the first match
s.IndexOf("xyz")             // -1, not found
s.Contains("lo,")            // True
s.StartsWith("Hell")         // True
s.EndsWith("!")              // False
s.Replace("World", "C#")     // "Hello, C#"
string.IsNullOrEmpty(s)      // False
```

## Strings are immutable

A method never changes the string it is called on; it returns a **new** one. Forgetting to use the result is a classic mistake:

```csharp
string text = "hello";
text.ToUpper();                // the result is thrown away
Console.WriteLine(text);       // hello

text = text.ToUpper();         // store the result
Console.WriteLine(text);       // HELLO
```

## Comparing strings

`==` compares the **contents** of two strings, and it is case-sensitive:

```csharp
Console.WriteLine("abc" == "abc");   // True
Console.WriteLine("abc" == "ABC");   // False
Console.WriteLine(string.Equals("abc", "ABC", StringComparison.OrdinalIgnoreCase));   // True
```

An empty string `""` has length 0. A variable that holds `null` has no string at all, and calling a method on it throws `NullReferenceException`. `string.IsNullOrEmpty` checks for both cases.
