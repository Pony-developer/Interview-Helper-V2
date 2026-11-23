`Main` calls several methods on strings, arrays and numbers that do not exist in the .NET library. Write them as **extension methods**, so that the calls compile.

Put the methods into **static classes above `Program`** (an extension method must be in a static class that is not nested in another). Their names, and the type that each one extends:

- `bool IsPalindrome(this string s)`: `true` when the string reads the same in both directions, **ignoring the case**. An empty string is a palindrome.
- `int WordCount(this string s)`: the number of words, separated by any number of spaces.
- `string Truncate(this string s, int maxLength)`: the string itself, if it is not longer than `maxLength`; otherwise the first `maxLength − 3` characters followed by `...`, so that the result is exactly `maxLength` characters long.
- `int Total(this int[] a)`: the sum of the elements (the name `Sum` is already used by LINQ).
- `bool IsSorted(this int[] a)`: `true` when the elements are in non-decreasing order. An empty array is sorted.
- `bool IsEven(this int n)`: `true` for even numbers.

Do not change `Main`. Expected output:

```text
True
False
True
3
Hello...
short
...
6
True
False
True
False
True
```

The lines in order: `"Level"`, `"hello"` and `""` for `IsPalindrome`; `WordCount` of `"  many   spaces here "`; `Truncate` of `"Hello, World!"` to 8, of `"short"` to 10, and of `"abcdef"` to 3; `Total` of `{ 3, 1, 2 }`; `IsSorted` for `{ 1, 2, 3 }`, `{ 1, 3, 2 }` and an empty array; and `IsEven` for 7 and 10.

Hint: an extension method is `public static`, in a `static class`, and the first parameter has the word `this`. For `WordCount`, `s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length` does the job.
