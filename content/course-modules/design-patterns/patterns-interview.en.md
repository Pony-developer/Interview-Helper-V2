Questions about patterns come up in almost every developer interview. Interviewers rarely want definitions recited from a book; they want to see that you **recognize problems** and **choose tools sensibly**.

## The typical questions

1. "Which design patterns do you know? Which have you used?"
2. "Explain pattern X. When would you use it?"
3. "What's the difference between X and Y?" (Decorator vs Proxy, Strategy vs State, Factory vs Abstract Factory, Adapter vs Facade.)
4. "What's wrong with Singleton?"
5. "Here's some code with a big `switch` / lots of `if`s. How would you improve it?"
6. "Which patterns do you see in .NET / in ASP.NET Core / in Dynamics?"

## A formula for answering "explain pattern X"

1. **One sentence in plain words:** "Decorator wraps an object to add behavior without changing it."
2. **The problem it solves:** "Otherwise you get a subclass for every combination of features."
3. **A real example:** "`GZipStream` over `FileStream`; in our project, a caching decorator over the pricing service."
4. **The trade-off:** "More small classes, and the order of the wrappers matters."

Thirty seconds, and you've shown understanding, experience and judgment.

## A formula for "which patterns have you used?"

Don't list 23 names. Tell **two or three short stories**:

> "In our Dynamics project, validation for an opportunity had about ten rules and kept growing. We made each rule a small class behind `IValidationRule` and ran them in a loop, a mix of Strategy and Chain of Responsibility. New rules became one class each, and we unit-tested them without Dataverse. The cost was more files, so we grouped them by entity."

Problem → pattern → result → cost. That's what a senior answer sounds like.

## Comparison cheat sheet

| Pair | The difference in one line |
| --- | --- |
| Decorator vs Proxy | Decorator **adds** behavior; Proxy **controls access** |
| Adapter vs Facade | Adapter makes **one** interface fit another; Facade **simplifies** a whole subsystem |
| Strategy vs State | Strategy is chosen **from outside**; State **switches itself** |
| Strategy vs Template Method | **Composition** (swap the object) vs **inheritance** (override a step) |
| Factory Method vs Abstract Factory | **One** product vs a **family** of matching products |
| Command vs Memento for undo | Command knows how to **reverse itself**; Memento **restores a snapshot** |
| Observer vs Mediator | Observer: publisher **broadcasts** to unknown subscribers; Mediator: a **coordinator** decides who reacts |

## Mistakes to avoid

- Saying "I always use patterns". It sounds like overengineering.
- Saying "patterns are useless". It sounds like you haven't worked on large code.
- Drawing UML from memory without explaining *why*.
- Mixing up Decorator and Proxy, or Strategy and State, without being able to say the difference.

## Remember

The best answer shows that you know **when to use a pattern and when not to**. Plain words, a real example, an honest trade-off.
