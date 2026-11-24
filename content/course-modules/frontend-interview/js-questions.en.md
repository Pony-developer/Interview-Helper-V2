A big list of questions on JavaScript itself: from tricky expressions and `this` to string, array and object methods. Only the questions the earlier modules don't already cover are here, and variations of the same question are merged into one. Many of them are "what does this code print", so answer out loud and, if you're unsure, check in the browser console, then take the quizzes after this slide: each question here has one matching quiz question.

## Basics

1. What is new in ECMAScript 2025?
2. Is JavaScript compiled or interpreted?
3. What is the difference between `x++` and `++x`? What does `let x = 0; console.log(x++); console.log(++x);` print?
4. What is the difference between lexical and dynamic scoping? Which one does JavaScript use?
5. What is `isNaN` for, and how is it different from `Number.isNaN`?
6. What does `const arr = [1, 2, 3]; arr[10] = 99; console.log(arr.length);` print?
7. What is negative infinity (`-Infinity`)?
8. Why is `typeof null === "object"`?
9. Which values are truthy and which are falsy in JavaScript?
10. What are undeclared and undefined variables?
11. What do `null ?? 'default'`, `undefined ?? 'default'` and `false ?? 'default'` return?
12. What are global variables, how are they declared, and what problems do they cause?
13. How do you delete a property of an object?
14. Why do `[1, 2] == [1, 2]` and `{} === {}` return `false`?
15. Does JavaScript support multiple inheritance?
16. How do timers work in JavaScript, and what are their drawbacks?
17. What does `for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), i * 100);` print? And with `var`?
18. What is the difference between ViewState and SessionState?
19. How do you submit a form with JavaScript?
20. What is a higher-order function?
21. What is strict mode and how do you enable it?
22. What is `this` in a plain function call, in strict mode, in an IIFE and in an ES module?
23. How does `this` behave in callbacks: in `setTimeout`, in a DOM event handler, in `forEach`? How does an arrow function fix it?
24. How does method chaining with `return this` work?

## Strings

25. What is the difference between `slice()`, `substring()` and `substr()`?
26. How do you check whether a string contains a substring and find its position (`includes`, `indexOf`, `lastIndexOf`, `startsWith`, `search`)?
27. How do you replace a substring, and how do you replace all occurrences?
28. How do you split a string into an array, and how do you get an array of its characters?
29. What is the difference between `charAt()` and `str[index]`?
30. How do you pad a string to a given length (`padStart`, `padEnd`)?
31. How do you change the case of a string? Does it change the original string?
32. How do you compare strings, including for sorting?
33. How do you test a string against a regular expression? When is `matchAll()` better than an `exec()` loop?
34. How do you convert a string to a number and back? How do you parse a number in another base?
35. How do you reverse a string?
36. How do you count the words in a string, or the occurrences of a character?
37. How do you find the longest word in a string?
38. How do you turn a string into a URL slug and remove everything except letters and digits?

## Arrays

39. How do you add and remove elements at the start and end of an array?
40. How do you check that a variable is an array?
41. How do you merge or copy arrays?
42. How do the `some` and `every` methods work?
43. How does `find()` differ from `filter()`? When are `findLast` and `findLastIndex` better?
44. What is the difference between `includes()` and `indexOf()` for arrays?
45. How do `reverse()` and `join()` work? Which methods change the array and which return a new one?
46. How do you fill an array with a given value?
47. How does the `splice` method work?
48. What are array-like objects, and how do you convert them to arrays?
49. How does the `flatMap` method work?
50. What does `sort` do by default, and how do you sort numbers or an array of objects by a property?
51. What is the difference between a shallow and a deep copy?

## Objects

52. How do you add a property with a dynamic key to an object?
53. What happens when an object literal has duplicate keys?
54. What does `JSON.stringify(obj, ['name', 'level'])` return?
55. How do objects created with `{}`, `new Object()` and `Object.create(null)` differ?
56. How do `Object.keys()`, `Object.values()` and `Object.entries()` differ?
57. How do you merge two objects?
58. What happens when you assign an object to another variable or put it in an array, and then change the original variable?
59. When would you use `Object.freeze`, `Object.seal` or `Object.preventExtensions`?
60. What happens when you use objects as keys of another object?
61. Write a function `multiplyByTwo(obj)` that multiplies all numeric values in an object by 2.

## Advanced topics

62. Which loops are there in JavaScript?
63. How do you change the style or class of an element?
64. What is the difference between `alert`, `confirm` and `prompt`?
65. What are the disadvantages of using `innerHTML`?
66. What is `void(0)` used for?
67. How do you create, read and delete a cookie with JavaScript?
68. What are escape characters, and what is the `escape()` function?
69. What is the `blur()` method for?
70. How do you read and write a file with JavaScript?
71. How do you detect the user's operating system?
72. Why does `function Items(list, ...param, list2) {}` cause a syntax error?
73. What does this code print?

    ```js
    let obj = { num: 2 };
    const fun = (x = { ...obj }) => {
      console.log((x.num /= 2));
    };
    fun();
    fun();
    fun(obj);
    fun(obj);
    ```

## Functions and utilities

74. How do you implement a deep equality check (`deepEqual`)?
75. How do you implement an event emitter with `on`, `off`, `once` and `emit`?
76. How does `Array.prototype.reduce()` work, and what happens without an initial value?
77. How do you flatten a nested array?
78. How do you deep-merge two objects, and what should you watch out for?
79. How does `getElementsByClassName` differ from `querySelectorAll`?
80. What is `Object.is()`, and how does it differ from `===`?
81. How does `Function.prototype.bind` work? Why do arrow methods ignore `call`?
82. What is the difference between `function Person() {}`, `const person = Person()` and `const person = new Person()`?
83. How do function declarations differ from function expressions when it comes to hoisting?
84. How do ES2015 classes differ from ES5 constructor functions? How do `extends` and `super` work?
85. How do `mouseenter` and `mouseover` differ?
86. What are the differences between `XMLHttpRequest` and `fetch()`?
87. How do `Map`/`Set` differ from `WeakMap`/`WeakSet`?

## Modern JavaScript (ES2020+)

88. What does optional chaining (`?.`) do, and where does it short-circuit?
89. What are the logical assignment operators (`||=`, `&&=`, `??=`)?
90. How do `Promise.all()`, `Promise.allSettled()`, `Promise.any()` and `Promise.race()` differ?
91. How do you cancel a `fetch` request with `AbortController`?
92. What is `error.cause`, and why is it useful?
93. What are `Object.groupBy()` and `Map.groupBy()`?
94. What is `Array.fromAsync()`?
95. How do you make a custom iterable with `Symbol.iterator`?
96. What are the differences between ES modules and CommonJS?
97. What are tagged template literals?
98. What is `BigInt`, and when should you use it?

## From "You Don't Know JS: Up & Going", chapter 3

These questions come from the topics that chapter 3 ("Into YDKJS") previews for the rest of the book series.

99. What is the module pattern built on closures, and how does it compare with ES modules?
100. What are the four rules that decide the value of `this`, and which one wins?
101. What is behavior delegation (objects linked to other objects), and how does it differ from class-style inheritance?
102. What is the difference between asynchronous, concurrent and parallel execution?
103. What problems do callbacks have (inversion of control, readability), and how do promises address them?
104. What are Web Workers, and what are their limits?
105. Why are JavaScript microbenchmarks often misleading, and how do you benchmark properly?
106. What happened to asm.js and SIMD.js, which older books recommend for performance?
107. What is a `Proxy`, and what is it used for?

## From "You Don't Know JS: Scope & Closures", chapter 2

These questions come from chapter 2, "Lexical Scope".

108. How does the engine look up a variable in nested scopes? What is shadowing, and when can you still reach a shadowed global?
109. How does `eval` change lexical scope, and what changes in strict mode?
110. What does the `with` statement do, and how can it leak a global variable?
111. Why do `eval` and `with` make code slower, and what other ways of running code from strings should you avoid?

## From "You Don't Know JS: Scope & Closures", chapter 4

These questions come from chapter 4, "Hoisting". One of the book's examples (functions declared in blocks) behaves differently in today's engines, and the quiz follows the current behavior.

112. What does `a = 2; var a; console.log(a);` print, and why? Where is a `var` inside a function hoisted to?
113. Is the name of a named function expression (`var foo = function bar() {}`) available outside the function?
114. When a `var` and a function declaration share a name, which is hoisted first?
115. What happens when a function with the same name is declared twice in one scope?
116. How do function declarations inside blocks (`if`) behave in modern JavaScript?

## From "You Don't Know JS: Scope & Closures", appendix B

These questions come from appendix B, "Polyfilling Block Scope". Block scope through `catch` and explicit `{ }` blocks for `let` are already in the "You Don't Know JS" module.

117. Why isn't wrapping code in an IIFE a drop-in replacement for a block scope?
118. How do transpilers turn `let` into code for older engines?

## From "You Don't Know JS: this & Object Prototypes", chapter 1

These questions come from chapter 1, "this Or That?", which is about what `this` is not. The rules that decide `this` are in question 100 and in the "You Don't Know JS" module.

119. Does `this` inside a function refer to the function itself? How can a function refer to itself?
120. Does `this` refer to the function's lexical scope? Can `this` reach a function's local variables?

## From "You Don't Know JS: this & Object Prototypes", chapter 3

These questions come from chapter 3, "Objects". Copying, freezing, iterating and listing keys of objects are already covered earlier in this module.

121. What is a property descriptor? What do `writable` and `Object.defineProperty` do, and what are the defaults?
122. What does `configurable: false` prevent, and can it be undone?
123. How do getters and setters (accessor descriptors) work?
124. How do you check whether a property exists, and whether it is enumerable?
125. What happens when you add named or numeric-looking properties to an array?

## From "You Don't Know JS: this & Object Prototypes", chapter 5

These questions come from chapter 5, "Prototypes". The prototype chain, `Object.create` and behavior delegation, `in` versus own-property checks, and checking relationships with `isPrototypeOf` are already covered earlier and in the "You Don't Know JS" module.

126. What happens when you assign to a property that exists higher on the prototype chain (writable, read-only, setter)? What is shadowing?
127. What does `obj.a++` do when `a` is inherited from the prototype?
128. Does `new` copy anything? What does the `constructor` property really mean, and why is it unreliable?
129. How do you link `Bar.prototype` to `Foo.prototype`, and what is wrong with `Bar.prototype = Foo.prototype` or `= new Foo()`?
130. What does the second argument of `Object.create` do?

## From "You Don't Know JS: Types & Grammar", chapter 1

These questions come from chapter 1, "Types". The list of built-in types, `typeof` (including `typeof null`), functions and arrays as subtypes of object, and undeclared versus undefined variables are already covered earlier and in the "You Don't Know JS" module.

131. What does a function's `length` property return?
132. How do you safely check whether an optional global (such as `DEBUG`) exists?

## From "You Don't Know JS: Types & Grammar", chapter 3

These questions come from chapter 3, "Natives". Boxing and wrapper objects (including the truthy `new Boolean(false)`), sparse arrays, `new Function` and checking for arrays are already covered earlier and in the "You Don't Know JS" module.

133. What does `Object.prototype.toString.call(value)` return, and why is it useful?
134. What does `Array(3)` create, and how does it differ from `Array(3, 4)` and `Array.from({ length: 3 })`?
135. How do built-in constructors such as `Date`, `String`, `Error` and `Symbol` behave with and without `new`?
136. What are the built-in prototypes like (`Array.prototype`, `Function.prototype`, `RegExp.prototype`), and why shouldn't you use or extend them?

## From "You Don't Know JS: Types & Grammar", chapter 5

These questions come from chapter 5, "Grammar". `x++` versus `++x`, `switch` and the temporal dead zone of `let` are already covered earlier and in the "You Don't Know JS" module.

137. Is an assignment an expression? What does `var a = b = 42` do inside a function?
138. Why does `{}` sometimes mean a block and sometimes an object literal? Why do `[] + {}` and `{} + []` give different results?
139. What are labeled statements, and how do `break` and `continue` work with labels?
140. How do operator precedence and associativity work (`&&` and `||`, the comma operator, chained `? :`)?
141. What is automatic semicolon insertion (ASI), and when does it bite?
142. How do `try`, `finally` and `return` interact?
143. How do default parameters interact with the temporal dead zone and `arguments`?

## From "You Don't Know JS: Async & Performance", chapter 2

These questions come from chapter 2, "Callbacks". Callback problems such as inversion of control and nesting are already in question 103.

144. What goes wrong when a callback is sometimes called synchronously and sometimes asynchronously ("Zalgo")?
145. How do error-first and split callbacks handle errors, and what can still go wrong?
146. How do you protect a callback from never being called, or being called more than once?

## From "You Don't Know JS: Async & Performance", chapter 4

These questions come from chapter 4, "Generators". What generators are, how `yield` pauses them and how to make a custom iterable with one are already covered in the Middle module and in question 95.

147. How do you pass values into a generator with `next(value)`, and why is the first `next()` argument ignored?
148. What happens when you `break` out of a `for..of` over a generator, and what happens to its `return` value?
149. What does `it.throw(error)` do to a paused generator?
150. How do generators combined with promises lead to `async/await`?
151. What does `yield*` delegation do?

## From "You Don't Know JS: Async & Performance", chapter 1

These questions come from chapter 1, "Asynchrony: Now & Later". What the event loop does, asynchronous versus concurrent versus parallel, timer delays and the basic order of promise callbacks and timers are already covered earlier and in the Middle module.

152. Why doesn't `var data = ajax(url); console.log(data)` log the response, and why isn't a synchronous request the fix?
153. Why can `console.log(obj)` show a value that changed after the call?
154. What does run-to-completion mean, and what kind of race condition is still possible in single-threaded JavaScript?
155. Why can't you rely on the order in which two responses arrive?
156. What are the "gate" and "latch" patterns for coordinating concurrent callbacks?
157. How do you keep a long-running computation from freezing the page?
158. How does the job (microtask) queue differ from the event loop queue, and what is starvation?
159. Can the engine run statements in a different order than they are written?

## From "You Don't Know JS: Async & Performance", chapter 6

These questions come from chapter 6, "Benchmarking & Tuning". Why one-off timings and microbenchmarks mislead, and how to benchmark with many runs and statistics, are already in question 105.

160. What makes a benchmark comparison fair? What is wrong with comparing `arr.sort()` against `arr.sort((a, b) => a - b)`?
161. Which optimizations are worth your time, and what is the critical path?
162. What is tail call optimization, and can you rely on it in JavaScript?

## From "You Don't Know JS: ES6 & Beyond", chapter 1

These questions come from chapter 1, "ES? Now & Future". Polyfilling versus transpiling, why new syntax can't be polyfilled and how `Object.is` differs from `===` are already covered earlier, in the Middle module and in the "You Don't Know JS" module.

163. How are ES6 and ES2015 related, and why should you check support feature by feature rather than by edition?
164. How do you polyfill `Object.is`, and how does the polyfill tell `0` from `-0` and recognize `NaN`?
165. How do you adopt new language features while still supporting older browsers?

## From "You Don't Know JS: ES6 & Beyond", chapter 2

These questions come from chapter 2, "Syntax". `let`/`const`, block-scoped functions, spread and rest, basic destructuring, arrow functions, `for...of`, template and tagged template literals, and symbols as unique keys are already covered earlier in this course.

166. When are default parameter values evaluated, and can they use other parameters?
167. How do defaults, renaming and nested patterns work in object destructuring?
168. What can you do with destructuring assignment (swapping, assigning to existing variables), and what can go wrong?
169. What do concise methods, computed property names, `__proto__` and `super` add to object literals?
170. How does JavaScript handle Unicode characters outside the basic range (`length`, the `u` flag, `normalize`)?
171. What is the global symbol registry (`Symbol.for`), and how hidden are symbol keys?
172. What does the sticky (`y`) regex flag do?

## From "You Don't Know JS: ES6 & Beyond", chapter 6

These questions come from chapter 6, "API Additions". `Array.from` for array-likes, `fill`, `find`/`findIndex`, `Object.is`, `Object.setPrototypeOf`, `Object.getOwnPropertySymbols`, `Number.isNaN`, `Number.isInteger`, `Number.EPSILON`, safe integers, `Math.trunc`, `includes`/`startsWith`/`endsWith`, `codePointAt` and `normalize` are already covered earlier and in the "You Don't Know JS" module.

173. What do `Array.of`, the map function of `Array.from` and `copyWithin` do?
174. How does `Number.isFinite` differ from the global `isFinite`?
175. What exactly does `Object.assign` copy, and how does it treat getters and setters?
176. What do `String.raw` and `repeat` do?
177. What do the array iterators `keys()`, `values()` and `entries()` return, and how do they treat holes?

## From "You Don't Know JS: ES6 & Beyond", chapter 8

These questions come from chapter 8, "Beyond ES6". Object spread and rest, `Array.prototype.includes`, SIMD and WebAssembly are already covered earlier in this module.

178. What does an `async` function return, what can you `await`, and can you cancel it?
179. How does the exponentiation operator `**` work, and what are its gotchas?
180. What happened to `Object.observe`, and what do you use instead?

## From "You Don't Know JS: ES6 & Beyond", chapter 7

These questions come from chapter 7, "Meta Programming". `new.target`, `Symbol.species`, `Symbol.iterator`, `Symbol.toStringTag` with `Object.prototype.toString`, proxy basics, `bound` function names and tail call optimization are already covered earlier and in the "You Don't Know JS" module.

181. How is a function's `name` inferred, and when is it empty or `"anonymous"`?
182. How does `Symbol.toPrimitive` work, and which hint do `+`, `*` and `String()` pass?
183. What do `Symbol.hasInstance`, `Symbol.isConcatSpreadable` and the regex symbols (`Symbol.replace` and others) let you customize?
184. What can't a proxy intercept, what is a revocable proxy, and why forward traps with `Reflect`?
185. What is the difference between the "proxy first" and "proxy last" patterns?
186. How does the `Reflect` API differ from the similar `Object` methods?
187. In what order does `Reflect.ownKeys` list keys, and how do `Object.keys`, `JSON.stringify` and `for..in` differ?
188. How do you feature-test new syntax at runtime?
