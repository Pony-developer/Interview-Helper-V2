Imagine a method that sorts or filters a list. The sorting rule may differ each time: by name, by age, in reverse. How should the method know which rule to use?

## Attempt 1: copy the method

```csharp
static void SortByName(List<Person> people) { /* sort by name */ }
static void SortByAge(List<Person> people) { /* sort by age */ }
```

Each rule needs its own copy of the same loop. Every change to the algorithm must be made in every copy.

## Attempt 2: a flag and a switch

```csharp
static void Sort(List<Person> people, string rule)
{
    if (rule == "name") { /* ... */ }
    else if (rule == "age") { /* ... */ }
}
```

Now one method has all the rules. A new rule means a new branch in this method, and the method must know about every rule in the program. The rule is also passed as a string, which the compiler cannot check.

## Attempt 3: an interface

```csharp
interface ISortRule { bool IsLess(Person a, Person b); }
```

This works, but every rule needs a new class with one method. That is a lot of ceremony for a single comparison.

## What we want

We want to pass the **behaviour itself** as an argument: "here is the rule, use it". The rule is a value, like a number, which the method calls when it needs it. C# does this with **delegates**: a type that holds a reference to a method. The next lectures show how to declare, use and shorten them.
