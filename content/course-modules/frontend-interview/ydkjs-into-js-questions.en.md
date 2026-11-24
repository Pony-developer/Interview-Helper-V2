Questions based on Kyle Simpson's *You Don't Know JS* books: chapter 2 "Into JavaScript" of *Up & Going* ([read it online](https://ydkj-doc.vercel.app/up_&_going/ch2)) and chapters 1 "What is Scope?" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch1)) 3 "Function vs. Block Scope" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch3)) and 5 "Scope Closure" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch5)) of *Scope & Closures*. Only the topics the earlier JavaScript modules don't cover are here: `typeof null`, truthy and falsy values, hoisting, `var`/`let`, strict mode, closures and the module pattern are already there. Try to answer each one out loud, then check yourself in the quizzes after this slide: each question here has one matching quiz question.

## Values, types and comparison

1. Do variables or values have types in JavaScript? What does `typeof` return?
2. Why are functions and arrays called subtypes of object? Can a function have properties?
3. How can a primitive string have methods like `toUpperCase()`? What is boxing?
4. What is the difference between explicit and implicit coercion?
5. Why is `[1, 2, 3] == '1,2,3'` true while two equal arrays aren't `==`?
6. What does `==` really do compared with `===`, and when is `==` risky?
7. How do `<` and `>` compare numbers and strings? Is there a strict form of `<`?
8. Why can `42 < 'foo'`, `42 > 'foo'` and `42 == 'foo'` all be false?
9. What makes a valid identifier? Can reserved words be property names?

## Functions, this and beyond

10. How does `switch` work, and what is fall-through?
11. What is the difference between anonymous and named function expressions?
12. What is an IIFE, and why use one?
13. What are the four rules that decide what `this` points to?
14. How does `Object.create` link objects, and what is behavior delegation?
15. What is the difference between polyfilling and transpiling?
16. When does a default parameter value apply?
17. Which parts of a typical JS program aren't JavaScript itself?

## What is scope?

18. Is JavaScript compiled? Which steps does compilation go through?
19. What really happens with `var a = 2;`, and what does a repeated `var a` do?
20. What are LHS and RHS look-ups?
21. How many LHS and RHS look-ups are in a small function call, and where are the hidden ones?
22. What happens when an LHS or an RHS look-up can't find a variable, with and without strict mode?
23. What is the difference between a ReferenceError and a TypeError?

## Function vs. block scope

24. Why hide variables and helper functions inside a function's scope? How can an undeclared assignment collide with another variable?
25. How do you tell a function declaration from a function expression?
26. Which variations of IIFEs are there?
27. Which JavaScript construct had block scope long before `let`?
28. Why create an explicit `{ … }` block for `let` variables?
29. What can break when you refactor code that uses `let` instead of `var`?

## Scope closure

30. When is closure actually observed? Is an IIFE an example of closure?
31. Why doesn't wrapping a loop body in an empty IIFE fix the classic `var` + `setTimeout` loop?
32. What two things make a function-based module?
33. How can a module change its own public API at runtime?
34. How do module loaders with `define` and `get` work under the hood?
35. How do static ES module APIs differ from function-based modules when a name is missing?
