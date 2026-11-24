Questions based on Kyle Simpson's *You Don't Know JS* books: chapter 2 "Into JavaScript" of *Up & Going* ([read it online](https://ydkj-doc.vercel.app/up_&_going/ch2)) and chapters 1 "What is Scope?" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch1)) 3 "Function vs. Block Scope" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch3)) 5 "Scope Closure" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/ch5)) and appendices A "Dynamic Scope" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/apA)) and C "Lexical-this" ([read it online](https://ydkj-doc.vercel.app/scope_&_closures/apC)) of *Scope & Closures*; and chapters 2 "this All Makes Sense Now!" ([read it online](https://ydkj-doc.vercel.app/this_&_object_prototypes/ch2)) 4 "Mixing (Up) Class Objects" ([read it online](https://ydkj-doc.vercel.app/this_&_object_prototypes/ch4)) 6 "Behavior Delegation" ([read it online](https://ydkj-doc.vercel.app/this_&_object_prototypes/ch6)) and appendix A "ES6 class" ([read it online](https://ydkj-doc.vercel.app/this_&_object_prototypes/apA)) of *this & Object Prototypes*; and chapters 2 "Values" ([read it online](https://ydkj-doc.vercel.app/types_&_grammar/ch2)) and 4 "Coercion" ([read it online](https://ydkj-doc.vercel.app/types_&_grammar/ch4)) of *Types & Grammar*; and chapters 3 "Promises" ([read it online](https://ydkj-doc.vercel.app/async_&_performance/ch3)) and 5 "Program Performance" ([read it online](https://ydkj-doc.vercel.app/async_&_performance/ch5)) of *Async & Performance*; and chapters 3 "Organization" ([read it online](https://ydkj-doc.vercel.app/es6_&_beyond/ch3)) and 5 "Collections" ([read it online](https://ydkj-doc.vercel.app/es6_&_beyond/ch5)) of *ES6 & Beyond*. Only the topics the earlier JavaScript modules don't cover are here: `typeof null`, truthy and falsy values, hoisting, `var`/`let`, strict mode, closures and the module pattern are already there. Try to answer each one out loud, then check yourself in the quizzes after this slide: each question here has one matching quiz question.

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

## Dynamic scope

36. How would the same code behave under lexical scope and under dynamic scope?
37. Why is `this` said to resemble dynamic scope?

## Lexical this

38. Why does a method lose its `this` when you pass it to `setTimeout`?
39. How do `self = this`, an arrow function and `bind(this)` each solve that, and how do they differ?

## this binding in depth

40. Does the strict mode of the call site or of the function body decide the default `this`?
41. Which object becomes `this` in a chain like `a.b.foo()`?
42. Can `new` override a function hard-bound with `bind`? Why is that useful?
43. What else does `bind` do besides fixing `this`?
44. Why is passing `null` as `this` to `apply` or `bind` risky, and what is safer?
45. What is `this` when you call the result of an assignment such as `(p.foo = o.foo)()`?
46. What is soft binding, and how does it differ from `bind`?
47. What happens when you pass a primitive as `this` with `call`?

## Classes and mixins

48. What is relative polymorphism, and which override runs when a parent method calls `this.method()`?
49. What does an explicit mixin actually copy?
50. What is explicit pseudo-polymorphism, and why is it brittle?
51. What is parasitic inheritance, and what does it mean for `new` and `instanceof`?
52. What problems come with faking multiple inheritance through mixins?

## Behavior delegation

53. When a delegated method sets `this.x`, which object gets the property?
54. What are the design guidelines of behavior delegation (OLOO)?
55. Can two objects delegate to each other?
56. Why does OLOO split object creation and initialization into two steps?
57. What is the catch with recursion in concise methods?
58. How do you check relationships between OLOO objects, and why doesn't `instanceof` fit?
59. What is duck typing, and how do thenables show its risk?

## ES6 class gotchas

60. Does a class instance get a copy of its methods? What happens if you change a method on the prototype later?
61. How can a property set in the constructor break a method of the same name?
62. Where should state shared by all instances live: class fields, `static` fields or the prototype?
63. Is `super` decided at call time like `this`? What happens when you borrow a method that uses `super`?
64. What does `class … extends Array` give you, and what can't be extended?

## Values in depth

65. Why is `0.1 + 0.2 === 0.3` false, and how do you compare such numbers?
66. Are there integers in JavaScript? What is the safe integer range?
67. How do you call methods on number literals, and how do `toFixed` and `toPrecision` differ?
68. What does `x | 0` do to a number?
69. What is `-0`, and how do you tell it apart from `0`?
70. What happens when numbers overflow or are divided by `Infinity`?
71. Which array methods can be borrowed for strings, and which can't?
72. Can `undefined` be reassigned?
73. Can a function replace the array you passed in?

## Coercion: conversions

74. Which values does `JSON.stringify` skip, and what does `toJSON` do?
75. What is a "falsy object"?
76. What is the `~` operator used for with `indexOf`, and what replaces it?
77. What does `parseInt` do when you pass it a number?
78. When does an object's `valueOf` win over its `toString`?
79. What does `+` do when one operand is an array or an object?
80. How can symbols be coerced?

## Coercion: operators and equality

81. What do `||` and `&&` actually return?
82. Why should you never write `== true`?
83. Which "crazy" `==` comparisons are `true`, and why?
84. How do `<`, `==` and `<=` compare two objects?

## Promises in depth

85. When does a promise executor run, and what happens if it calls `resolve` twice or throws?
86. How do values and errors flow through a chain of `then` calls?
87. Why doesn't the second argument of `then` catch an error thrown by the first?
88. How do `resolve`, `reject` and `Promise.resolve` treat a promise passed to them?
89. Can you rely on the order of callbacks from different promises?
90. How do you add a timeout to a promise, and does it cancel the work?
91. What do `Promise.all` and `Promise.race` do with an empty array?
92. What are the limitations of promises?

## Web Workers in depth

93. How do you send a large buffer to a worker without copying it?
94. What can code inside a Web Worker do, and how do you stop a worker?
95. What is a `SharedWorker`, and when is it useful?

## Iterators, modules and classes

96. Can you iterate the same iterator twice?
97. What are live bindings in ES modules? Can you assign to an import?
98. Which forms of `import` are there?
99. What happens with circular imports between ES modules?
100. What is `new.target`, and how can it help build an abstract class?
101. Are static methods inherited by subclasses?
102. What is `Symbol.species` for?

## Collections

103. How do typed arrays share an `ArrayBuffer`, and what is endianness?
104. What happens when you store out-of-range values in a `Uint8Array` or a `Uint8ClampedArray`?
105. How does a `Map` decide whether two keys are the same?
106. What are the common gotchas when working with a `Map`?
107. How does a `Set` treat `NaN`, `-0` and `'1'` vs `1`, and which set operations are built in?
