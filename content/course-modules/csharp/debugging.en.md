**Debugging** is finding out why a program does what it does. Printing values with `Console.WriteLine` works, but a **debugger** is faster: it pauses the program at a chosen line and lets you look at everything.

The online runner in this course has no debugger, so the practice tasks use printing. On your own computer, Visual Studio, Visual Studio Code and JetBrains Rider all have one.

## The key ideas

- **Breakpoint**: a marker on a line. When execution reaches it, the program pauses **before** the line runs.
- **Stepping**: from the pause, you run the program one line at a time and watch it change.
- **Inspection**: while paused, you can see the current value of every variable.

## Windows you will use

| Window | What it shows |
| --- | --- |
| **Locals** (Autos) | the variables of the current method with their values |
| **Watch** | expressions you chose, such as `total / count`, re-evaluated at every step |
| **Call Stack** | the chain of methods that led to the current line |

You can also hover over a variable in the editor to see its value.

## Hotkeys (Visual Studio and VS Code)

| Key | Action |
| --- | --- |
| `F9` | toggle a breakpoint on the current line |
| `F5` | start with debugging, or continue to the next breakpoint |
| `Ctrl+F5` | start **without** debugging |
| `F10` | **step over**: run the current line, and do not go inside the methods it calls |
| `F11` | **step into**: if the line calls a method, go inside it |
| `Shift+F11` | **step out**: finish the current method and return to its caller |
| `Shift+F5` | stop debugging |

Other editors may use different keys by default: check the debug menu.

## A debugging session

1. Reproduce the bug and decide what you expect to see.
2. Set a breakpoint **before** the place where things go wrong.
3. Run with `F5`. The program stops at the breakpoint.
4. Step with `F10`, and after each step compare the variables with what you expected.
5. The first step where a value is wrong tells you which line holds the bug. If that line calls a method, run again and step **into** it with `F11`.
6. Fix, remove the breakpoint and run the whole program again.

A **conditional breakpoint** (right-click the breakpoint) pauses only when an expression is true, for example `i == 99`. It is a lifesaver when the problem appears only on the hundredth repetition.

## Experiments

Debugging is the scientific method in miniature:

1. Make a **hypothesis**: "the result is wrong because the division is done on integers".
2. Design a **small experiment** that would prove or disprove it: print the types, or try the same formula with `2.0`.
3. **Run it** and look at the result. If the hypothesis was wrong, drop it and form a new one.

Rules that save hours:

- Change **one** thing at a time, otherwise you do not know which change helped.
- Make the experiment in a small separate program when the real one is too large.
- Trust the evidence rather than your memory of what the code does. The bug is where your assumption is wrong, so test the assumptions you are most sure about.
- Write down what you have already tried.
