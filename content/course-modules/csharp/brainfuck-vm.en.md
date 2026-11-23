Brainfuck is a tiny programming language with eight commands, and it is a good test of loops and arrays. The program works on a **tape** of 30000 byte cells, with a pointer that starts at cell 0:

| Command | Meaning |
|---|---|
| `>` | move the pointer one cell right |
| `<` | move the pointer one cell left |
| `+` | add 1 to the current cell (255 + 1 becomes 0) |
| `-` | subtract 1 from the current cell (0 - 1 becomes 255) |
| `.` | output the current cell as a character |
| `,` | read the next input character into the current cell (0 at the end of the input) |
| `[` | if the current cell is 0, jump forward to the matching `]` |
| `]` | if the current cell is not 0, jump back to the matching `[` |

Write the method `static string Run(string program, string input)`. It interprets the program and returns the text it outputs. Do not change `Main`. Expected output:

```text
Hello World!
A
B
```

The lines: the program `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.` writes `Hello World!` and a newline; the program `++++++++[>++++++++<-]>+.` writes `A`; and the program `,+.` with the input `A` writes `B`.

Hints:
- Use `byte[] tape = new byte[30000];`. Byte arithmetic wraps around by itself, so `255 + 1` is `0`.
- Before the run, match the brackets once: walk the program with a `Stack<int>`, and store in an array the position of the partner of each bracket. Then `[` and `]` can jump in constant time.
- Use a `StringBuilder` for the output, and a `switch` on the command character inside a `for` loop over the program.
