A string looks like an array of characters: it has a `Length`, you read `s[i]`, and you can go through it with a loop. But the two types differ in ways that matter.

## Similar

```csharp
string s = "hello";
char[] a = { 'h', 'e', 'l', 'l', 'o' };

Console.WriteLine(s.Length + " " + a.Length);   // 5 5
Console.WriteLine(s[1] + " " + a[1]);           // e e
```

## Different

| | `string` | `char[]` |
| --- | --- | --- |
| Can you change a character? | **no**, a string is immutable: `s[0] = 'H'` does not compile | yes: `a[0] = 'H'` |
| `==` compares | the **text** | the **references** (two different arrays are not equal) |
| Methods | `ToUpper`, `Contains`, `Split`, `Replace`, ... | the `Array` class: `Sort`, `Reverse`, ... |
| Printing | prints the text | `Console.WriteLine(a)` prints the characters too, but `a.ToString()` does not |
| Memory | one value | a mutable block you can pass around and change |

To "change" a string you create a new one: `s = "H" + s.Substring(1);`.

## Converting between them

```csharp
char[] letters = "hello".ToCharArray();   // string -> char[]
Array.Reverse(letters);                   // work on the array: olleh
string back = new string(letters);        // char[] -> string
Console.WriteLine(back);                  // olleh
```

This is the classic way to do a job that needs changing the characters: copy to a `char[]`, modify, and make a string from the result.

Sorting the letters of a word is the same idea:

```csharp
char[] chars = "banana".ToCharArray();
Array.Sort(chars);
Console.WriteLine(new string(chars));     // aaabnn
```

Two words are **anagrams** when sorting their letters gives the same string.

## Strings and collections of strings

| You have | And you want | Use |
| --- | --- | --- |
| a `string` with separators | the parts as an array | `text.Split(...)` |
| an array or list of strings | one string | `string.Join(", ", items)` |
| a `string` | its characters as a list | `new List<char>(text)` |
| a lot of small pieces to append | one string, efficiently | `StringBuilder` |

## Comparing strings

`==` and `Equals` compare the text **exactly**, character by character, so `"abc" == "ABC"` is `False`. For comparisons that ignore the case, say it explicitly:

```csharp
string.Equals("abc", "ABC", StringComparison.OrdinalIgnoreCase);   // True
"abc".ToLower() == "ABC".ToLower();                                 // True, but creates two new strings
```

`StringComparison.Ordinal` compares the character codes, and it is fast and predictable. The other family, such as `CurrentCulture`, follows the rules of a language: it is what you want for text shown to people, but the result may depend on the computer's settings.

## Ordering strings

```csharp
Console.WriteLine("apple".CompareTo("banana") < 0);   // True: apple comes first
Console.WriteLine(string.Compare("b", "a") > 0);      // True
```

`CompareTo` returns a negative number if the first string goes first, zero if they are equal, and a positive number otherwise. `Array.Sort` and `List<string>.Sort` use it. By default the ordering follows the culture's alphabet, so for lower-case ASCII words you get the alphabetical order you expect. For a predictable order independent of the settings, pass a comparer: `Array.Sort(words, StringComparer.Ordinal)`.

Mind the case in the ordinal order: all the capital letters come **before** the lower-case ones (`"Zebra"` before `"apple"`).

## Empty, null and white space

```csharp
string.IsNullOrEmpty(s)        // null or ""
string.IsNullOrWhiteSpace(s)   // null, "" or only spaces and tabs
```

`""` has a length of 0, while `null` has no string at all, and `s.Length` throws a `NullReferenceException`. Check before you use a string that may be missing.

## Immutability has a price

Each `+` or `Replace` creates a new string. For a few operations it does not matter. For thousands of appends in a loop, collect the pieces in a `StringBuilder` (the next lecture).
