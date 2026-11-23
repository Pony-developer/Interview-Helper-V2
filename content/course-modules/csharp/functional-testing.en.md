A unit test looks at a method from inside. **Functional testing** looks at the program from the outside, as a user does: given this input, does the program do what the specification says? It does not care how the code is written.

## Black box and white box

| | Black box | White box |
| --- | --- | --- |
| The tester knows | the requirements, the inputs and the outputs | the code and its structure |
| Tests are designed from | the specification | the branches and paths in the code |
| Typical | functional, acceptance, UI tests | unit tests, coverage-driven tests |
| Finds | missing or wrong features | logic errors, untested paths |

Both views are needed. A black-box test notices that the program does not do what the user wants, and a white-box test notices a branch that nobody has ever tried.

## The levels of testing

```text
          /\
         /  \        few, slow:     end-to-end (the whole system, like a user)
        /----\
       /      \      some:          integration (several parts together)
      /--------\
     /          \    many, fast:    unit (one method or class)
    /------------\
```

The shape is the **test pyramid**. The lower the level, the cheaper, faster and more precise a test is, so there should be more of them.

- **Unit tests** check small pieces in isolation, in milliseconds.
- **Integration tests** check that parts work **together**: your code with a real database, a file, a web service, or two modules with each other. They are slower, and they find the problems at the seams.
- **System (end-to-end) tests** run the whole application through its real interface, for example by driving a browser. They show that the user's path works, but they are slow and fragile.
- **Acceptance tests** check against the customer's requirements: "is this what we agreed to build?"

When the whole suite is made of end-to-end tests, a single run takes hours, failures are hard to locate, and people stop running it.

## A functional test for a console program

A program with a clear input and a clear output can be tested through that interface. In this course, every practice task is such a test: the whole program runs, and its output is compared with the expected text.

```csharp
static string Run(string input) { /* feeds the input, returns what the program prints */ }

Check("greeting", Run("Ann"), "Hello, Ann!");
Check("empty name", Run(""), "Hello, stranger!");
```

For a web service, the same idea is an HTTP request and a check of the response: the status code, the body, the headers.

## Regression and smoke tests

- A **regression test** checks that something that used to work still works after a change. Every bug fix leaves one behind.
- A **smoke test** is a minimal check that the program starts and its main path works at all. If it fails, there is no point in running anything else.

## Manual and automated

| | Manual | Automated |
| --- | --- | --- |
| Good for | exploring something new, usability, how it **feels** | everything that repeats: regression, many inputs, nightly runs |
| Weakness | slow, tiring, not repeatable | costs time to write and maintain; checks only what it was told to check |

Automate what you do again and again. Keep humans for what a person notices better: a confusing screen, an odd workflow, "this does not feel right". **Exploratory testing**, where a person freely explores the program and records what surprises them, finds problems that no script was written to expect.

## Other kinds of testing

Functional testing asks "does it do the right thing?" Non-functional testing asks "how well?":

- **performance**: how fast, and how many users at once;
- **security**: can it be broken into or misused;
- **usability** and **accessibility**: can people actually use it;
- **compatibility**: other systems, browsers, devices and language settings.

## Designing a functional test

1. Take a **requirement**, ideally written as an example: "a customer over 65 pays 7".
2. Choose **representative inputs** and the **borders** (see the lecture on more tests).
3. Write down the **expected result before** running the program, from the specification and not from what the program printed.
4. Run it, compare, and record the result.
5. If the expectation and the result differ, decide **which one is wrong**: the program or the specification.

The last step matters. A failing test is sometimes a discovery that the requirement was unclear, and that is valuable too.
