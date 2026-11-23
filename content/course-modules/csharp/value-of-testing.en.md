Tests cost time. Writing them takes hours, and keeping them up to date never stops. So why do experienced developers insist on them? Because the alternative costs more, only later, and with interest.

## The cost of a bug grows with time

The same defect is cheap when it is found early, and expensive when it is found late:

| Where it is found | Typical cost |
| --- | --- |
| while you type: the compiler or a unit test | seconds |
| in the code review or the build | minutes |
| by a tester before the release | an hour or a day |
| by a customer in production | days, money, trust, and sometimes much worse |

A test is a way of finding the bug at the cheapest moment. A bug found on your own computer, a minute after you wrote it, still has the whole context in your head.

## What tests give you

**1. Confidence to change the code**

Without tests, every change is a risk. You are afraid to touch the code that works, so it rots. With tests, you refactor, optimize and extend, and the suite tells you within seconds whether you broke anything. Tests make **courage** cheap.

**2. Living documentation**

A comment can fall out of date, but a passing test cannot lie about what the code does *today*. A good test name and a few examples show a newcomer how a method is meant to be used and what it promises:

```text
IsLeapYear_Year1900_ReturnsFalse
IsLeapYear_Year2000_ReturnsTrue
```

**3. Better design**

Code that is hard to test is usually badly designed: it does too many things, depends on the clock, the network and global state. Wanting to test forces you towards small methods with explicit inputs and outputs, which are easier to read, too.

**4. Speed, in the long run**

At the start, a project with tests feels slower. After a few months it is **faster**, because nobody spends days looking for what broke, and nobody is afraid to change anything.

**5. A precise bug report**

A failing test is the most exact description of a bug: "with this input, I expected this and got that". It can be handed to a colleague, and it proves the fix when it turns green.

## Test-driven development

In **TDD** you write the test **before** the code, in short cycles:

1. **Red**: write a test for the behaviour you want. It fails, because the code does not exist yet.
2. **Green**: write the simplest code that makes it pass.
3. **Refactor**: clean up the code and the test while everything stays green.

The tests then describe the behaviour you wanted, not the behaviour you happened to write. TDD is not the only way to get good tests, and not everyone likes it. But **red, green, refactor** is a useful rhythm for a bug fix: first the test that fails, then the change that fixes it. You did exactly that in the "Make the tests pass" task.

## What tests cannot do

- They cannot prove that there are **no** bugs. They show only that the cases you thought of work.
- They check what you **expect**, not what you forgot to expect.
- They cannot tell you that you built the wrong thing. The tests might pass for a program that nobody needs.
- Bad tests are worse than none. A slow, flaky or misleading test costs attention and gives false comfort.

## Testing is a trade-off

Not all code deserves the same effort. Money, security, data and anything that is hard to fix after release deserve many tests. A one-off script that you will delete tomorrow may deserve none. Spend the effort where a failure would hurt most, and where the code is most likely to change.

## Typical objections

- **"I have no time to write tests."** You will spend the time later, debugging, and with more stress.
- **"My code is simple, it obviously works."** Then the test is two minutes of work, and the next person to change it will be glad.
- **"Tests slow the changes down."** Bad tests do. Fast, independent tests about behaviour speed changes up.
- **"The testers will find it."** A tester finds a bug days later, and a unit test finds it in seconds. They also look for different things, and the team needs both.
