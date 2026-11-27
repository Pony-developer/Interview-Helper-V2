**In plain words:** a design pattern is a **named recipe** for a problem that programmers meet again and again. It is not code you copy and not a library you install. It is an idea: "when you have *this* kind of problem, shape your classes *like this*".

## A picture from life

Think of how houses are built. Every architect solves the same small problems: how to let light into a room, how to get from one floor to another, how to keep rain off the door. Over time the good answers got names: *window*, *staircase*, *porch*. Saying "put a porch here" is faster than explaining the whole idea from scratch.

Design patterns are the same for code. Saying "wrap it in a **decorator**" or "use a **strategy** here" tells another developer a whole design in two words.

## Where they come from

In 1994 four authors (Gamma, Helm, Johnson and Vlissides, the "Gang of Four", **GoF**) wrote the book *Design Patterns*. They collected **23 patterns** they kept seeing in good object-oriented code. Those 23 are what interviews usually mean by "design patterns". This course covers the ones you will actually meet, plus a few modern ones (Dependency Injection, Repository, Unit of Work).

## The three families

| Family | Question it answers | Examples |
| --- | --- | --- |
| **Creational** | *How* do we create objects? | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Structural** | How do we *put objects together*? | Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight |
| **Behavioral** | How do objects *talk and share work*? | Strategy, Observer, Command, State, Chain of Responsibility, ... |

## What a pattern consists of

Every pattern has four parts, and that's how each lecture in this course is built:

1. **Name**: so we can talk about it.
2. **Problem**: the situation where it helps.
3. **Solution**: which classes and interfaces, and how they relate.
4. **Consequences**: what you gain and what you pay (usually more classes and one more level of indirection).

## Why bother

- **A shared language.** Code reviews and design talks get much shorter.
- **Proven solutions.** Someone has already hit the corner cases.
- **Reading other code.** .NET itself is full of patterns: `IEnumerable` is Iterator, `event` is Observer, `Stream` wrappers are Decorators. Knowing the pattern, you understand the library faster.
- **Interviews.** "Which patterns do you know and where did you use them?" is one of the most common questions for a developer role.

## Remember

A pattern is a tool, not a goal. Good code is **simple** code that solves the problem; a pattern is worth adding only when the problem it solves is actually in front of you.
