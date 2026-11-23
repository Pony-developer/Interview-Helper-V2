A small text editor must support **undo**. Every change first saves the old text on a stack; undo pops the last saved text back. The class `TextEditor` has the field `history` (a `Stack<string>`) and the property `Text`. Write three methods:

- `Type(string s)`: saves the current text on the stack, then adds `s` to the end;
- `Erase(int n)`: if the text is empty, does nothing. Otherwise saves the current text, then removes the last `n` characters. If there are fewer than `n`, remove them all;
- `Undo()`: if the history is empty, does nothing. Otherwise restores the text from the top of the stack.

Do not change `Main`. Expected output:

```text
hello world
hello
hello world
hello
[]
[]
```

The lines in order: the text after two typings; the text after erasing 6 characters; the text after one undo, which brings back the text before the erasing; the text after the second undo; then three undos with an empty history. The text is `[]` (empty), and an erase on an empty text changes nothing.

Hint: `history.Push(text)` saves the text before the change. `text.Substring(0, text.Length - remove)` cuts the end, where `remove` is `Math.Min(n, text.Length)`. `Undo` is `text = history.Pop();`, guarded by `history.Count > 0`.
