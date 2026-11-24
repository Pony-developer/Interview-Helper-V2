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
