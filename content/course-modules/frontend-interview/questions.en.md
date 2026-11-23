Below are the questions that come up most often in frontend interviews. First try to answer each one out loud, in your own words, then check yourself in the quizzes after this slide: each question here has one matching quiz question.

## General questions

1. Do you follow news in the frontend world? How exactly?
2. What makes good code different from bad code?
3. Which HTTP methods and status codes do you know?
4. What is dangerous about executing code that comes from a user?
5. What is OOP?
6. What is the difference between a class and an abstract class?

## HTML/CSS basics

7. What is DOCTYPE and why is it used?
8. What are the main tags that make up the structure of an HTML page?
9. What are semantic tags and why do we need them? Give examples.
10. What can you say about the `<br>` tag?
11. Which tags from the most recent updates do you know?
12. What is the difference between `<div>` and `<span>`?
13. What are data attributes, and when do you use them?
14. How are the `class` and `id` attributes used? What is the difference between classes and ids?
15. What are internal and external hyperlinks, and which attributes do they have?
16. What do you know about SVG? What are the ways to add SVG to a page? How do they differ?
17. How do you create a form in HTML and validate it?
18. What kinds of lists are there in HTML? What are `ul` / `ol` / `dl`?
19. What is an `iframe` and what is it used for?
20. Which methods of sending form data do you know?
21. What are the main differences between block and inline elements in HTML? How do they affect the page structure?
22. Which CSS methodologies do you know, and which do you use yourself? Justify your current choice.
23. What are CSS selectors? Give examples.
24. How does inheritance work in CSS?
25. What is the CSS box model, and how can you change it?
26. What is the difference between `margin` and `padding`?
27. What is Flexbox? How do you build a layout with Flexbox or Grid, and which approach fits which case?
28. What are media queries and how do you use them?
29. How can you hide an element with CSS? Do `opacity: 0`, `display: none` and `visibility: hidden` behave the same?
30. How do you put a logo in the middle of the screen?
31. How do you place a close "×" button in the top-right corner of an element?
32. How do you make the last list item red, whatever the length of the list, without JS?
33. What are the ways to specify a color?
34. What is `z-index`? Does every element have it?
35. What are the pros and cons of CSS preprocessors?
36. What are the ways to center an element in CSS?
37. Which ways to center vertically in CSS do you know?
38. Why are there different heading levels if the size can be set with styles?
39. What are the options for positioning an element on the page?
40. What `display` values are there? Which one do you use most? What is special about `inline-block`?
41. What is the difference between `position: relative` and `position: absolute`?
42. Which units of size are there in CSS?
43. What are the risks of negative margins?
44. What are pseudo-classes and pseudo-elements? How do they differ? How do you use them in CSS?
45. What is adaptive design?
46. What is the difference between an image added with the HTML `<img>` tag and one added with the CSS `background-image` property?
47. How do you deal with cross-browser compatibility issues, including different browser versions?
48. How do you make a site accessible using HTML and CSS?
49. How do you implement responsive design with CSS?
50. Explain the concept of CSS variables.
51. Which CSS properties affect performance?
52. What usually hurts a site's performance the most?
53. How do you make two columns in CSS so that one stretches and the other does not?
54. What are the pros and cons of CSS animations compared with JS animations?
55. How can you override `!important`, or get a similar effect without `!important`?
56. Is this HTML valid? Fix all the errors. Tell us about HTML validity in general.

    ```html
    <ul>
    <a href="/some-url"><li>Some Link in Menu</a></li>
    <a href="/some-url"><li>Some Link in Menu</li></a>
    <ul>
    ```

57. What is the mobile-first approach, and what are its pros and cons?
58. Explain how the specificity of CSS selectors is calculated.
59. What are pre- and postprocessors used for?
60. Name the input types in forms. How do you send a form to the server (without JS)?

## Web performance

61. What do you know about Core Web Vitals?
62. How do lab and field performance measurements differ?
63. Which image formats do you know, and how do they differ?
64. Your site loads slowly on a mobile device. Walk through, step by step, how you would find the cause.
65. Which tools do you use to optimize page load speed when working with HTML and CSS?
66. How do you optimize images on a page to improve performance?
67. Which page optimization techniques do you know?

## JavaScript basics

68. List the data types in JS.
69. How does an array differ from an object? When do you use which?
70. Events in JS. Talk about event propagation, bubbling, delegation, preventing default and so on.
71. What is the difference between `var`, `let` and `const`? When should you use which?
72. Can a `const` be redefined?
73. Do you know the DRY, KISS and YAGNI principles?
74. How does LocalStorage differ from SessionStorage? How do you use them in JavaScript? When do you think they are worth using?
75. What is a closure in JavaScript and how does it work?
76. What is the scope of a variable?
77. What is an anonymous function?
78. What is an arrow function, and how does it differ from a regular function?
79. Which array iteration methods do you know?
80. What is JSON and how do you work with it in JavaScript?
81. How is asynchronous code executed in JavaScript?
82. How do you work with asynchronous code in JavaScript without async/await? What other approaches to asynchrony do you consider?
83. The difference between `==` and `===`.
84. What is a prototype in JavaScript?
85. What is the difference between `null` and `undefined`?
86. What is context? How can you change the context a function runs in?
87. What is a Promise? When do you use one?
88. What is special about object-oriented programming in JavaScript?
89. How do you access an HTML element from JS and change its text?
90. What is destructuring?
91. What happens if you access an element by an index that does not exist (`const arr = ['a', 'b']; console.log(arr[20])`)?
92. What is the difference between `for...of` and `for...in`?

## TypeScript

93. What are the main differences between TypeScript and JavaScript?
94. What are the pros and cons of using TypeScript?
95. What are data types in TypeScript and how are they used?
96. Tell us about interfaces in TypeScript and give examples of how they are used.
97. How do generics work in TypeScript and why are they useful?
98. How can you use enums in TypeScript, and what are their advantages?
99. How does TypeScript improve type safety compared with JavaScript?
100. What refactoring and maintenance capabilities does TypeScript give you?
101. What are decorators in TypeScript and when are they used?
102. How are namespaces and modules used in TypeScript?
103. Which strategies for migrating from JavaScript to TypeScript do you know?

## Browser APIs

104. What is the DOM?
105. How does JavaScript interact with the DOM?
106. What is AJAX?
107. How do you make an HTTP request with JavaScript?
108. What is JSONP and how is it used?
109. What are the ways to store data in the browser?
110. What is event handling in JavaScript?
111. What are event bubbling and event capturing in DOM event handling? How do you use them to handle events efficiently?
112. What is event delegation in the DOM, and how do you use it to optimize event handling, especially on large pages?

## Frameworks and libraries

113. Why are frameworks used, and what are their pros and cons?
114. What should guide the choice of a framework?
115. What is the component-based approach?
116. What is the problem of state management, and what approaches solve it?
117. What is the virtual DOM?
118. Which component lifecycle methods do you know?
119. How do you optimize the performance of framework-based solutions?
120. What is server-side rendering? Why is it needed, and what are the ways to implement it?
121. How do you work with APIs within libraries and frameworks?
122. What is special about data management and routing?
123. What are the main differences between Angular and React?
124. How do you tell class components from function components in React? When do you think each type is the right choice?
125. How can you optimize performance in React apps? How do you avoid excessive re-rendering and speed up component loading?
126. How do you manage state in React apps? How do you keep more complex or global state readable and efficient?
127. How do you handle forms in React? Which approaches do you use for validation and form handling?
128. How do you run a function only on the first render of a component?
129. How do you handle events in React?
130. What are React hooks, and which built-in hooks do you use?
131. What conditions must a function meet to be a hook?
132. How do you do server-side rendering in Next.js? What advantages do you see, and when is it the best fit?
133. What are components in Vue.js?
134. How does the `ngIf` directive work in Angular?
135. You need to compute a coefficient that a component uses and that depends only on a few constants in the project. Where is the best place to compute it?

## Networking and protocols

136. What are HTTP and HTTPS, and how do they differ?
137. What are the main HTTP request methods (GET, POST, PUT, DELETE), and how do they differ?
138. What are HTTP status codes? Give examples of the most common ones.
139. What is a REST API and what are its main principles?
140. Which security measures are used when working with web requests?
141. What are JSON and XML, and how do they differ in use?
142. How does CORS (Cross-Origin Resource Sharing) work?
143. What is WebSocket, and how does it differ from regular HTTP requests?
144. How does caching of web resources work?
145. What is SSL/TLS and how is it used to provide security?

## Working with the backend

146. What is an API and how does the frontend interact with it?
147. What formats are used to exchange data between the frontend and the backend?
148. What are CRUD operations and how are they implemented in practice?
149. How do you use WebSockets for real-time communication?
150. Which authentication and authorization mechanisms are used in modern web apps?
151. What are the main principles of storing and transferring user data securely?
152. What is GraphQL, and what are its pros and cons compared with REST?
153. Which data caching strategies can be used on the frontend?
154. How can you process large amounts of data without hurting frontend performance?
155. Which tools and approaches are used to monitor and debug requests to the server?

## Algorithms and data structures

156. What is algorithmic complexity and how do you estimate it?
157. Tell us about the basic data structures, such as arrays, lists, stacks and queues.
158. Which sorting algorithms do you know and how do they work?
159. How do you implement breadth-first and depth-first search on a graph, and where is that needed on the frontend?
160. What is recursion? Give examples of its use.
161. How can you optimize algorithms with memoization?
162. Which search algorithms do you know and how do they differ from each other?
163. How does a hash table work, and what are its pros and cons?
164. Tell us about algorithms for working with trees, such as a binary search tree.
165. Which algorithms can be used to find the shortest path in a graph?
