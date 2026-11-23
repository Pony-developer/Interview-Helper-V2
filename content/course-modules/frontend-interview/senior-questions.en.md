Questions for a Senior Front-end Developer interview. At this level interviewers assess not only technical depth but also how you make decisions, work with the team and help others grow. Try to answer each one out loud, drawing on your own experience and concrete examples, then check yourself in the quizzes after this slide. Each question here has one matching quiz question.

## General questions

1. What knowledge and skills must a Senior developer have?
2. What should work and communication in a development team look like?
3. Which project estimation and planning methods do you use?
4. What do you pay attention to when choosing technologies for a project?
5. How do you approach mentoring and growing less experienced developers?
6. How do you introduce new technologies or practices into a team?
7. How do you resolve conflicts and problems in a team?
8. What will frontend development look like in two or three years?
9. Which of the new frameworks have you tried?
10. Do you have pet projects? Perhaps you contribute to open source?
11. Do you speak at conferences or meetups?
12. Do you regularly share your professional thoughts anywhere? Which communities are you part of?
13. Which podcasts, channels or authors would you recommend?
14. Which new tools have you started using and can recommend?

## HTML/CSS

15. Which class naming systems do you know? Do you use any at all?
16. How do you build your CSS?
17. Have you worked with Web Components? What is the Shadow DOM?
18. Why do some tags, such as `img`, have no pseudo-elements?
19. Is there a place for the CSS `float` property in the modern web?
20. What is fluid (responsive) typography? Which techniques do you know and use on your projects?
21. Describe your view of modern responsive web design: what are the alternatives to media queries? Justify your choice of units and values for breakpoints.
22. How does Node Sass differ from Dart Sass, and what does migrating involve?
23. Name the differences between `@import`, `@use` and `@forward` in Sass.
24. Do you create style guides for your projects? Which techniques or tools do you use?
25. What are the alternatives to `overflow: hidden`?
26. A designer insists on custom styles for every element of a complex form. What do you do?
27. What are the use cases for `@media` in CSS besides `screen`?
28. How do you deal with large volumes of styles and maintaining big codebases in large projects? Which approaches and methodologies do you use to organize CSS at the architecture level?
29. How do you optimize page loading, including critical CSS and other strategies to cut the time to first byte and the time to first render?
30. Tell us about your experience with CSS preprocessors (such as Sass or Less) and other tools for automating tasks in large projects.
31. How do you handle cross-browser compatibility during development, and how do you avoid misunderstandings between developers and QA when testing in different browsers?
32. How do you implement server-side rendering (SSR) or static site generation (SSG) with CSS-in-JS, and what challenges can you face?
33. Which new CSS feature (one still being developed or shipping in some browsers) are you looking forward to most? Why that one?
34. Imagine you have learned about your next project: a large public multilingual site that includes Arabic and Japanese. Two junior frontend developers will help you. Describe how you would plan the CSS architecture and prepare your juniors for the project.
35. You need a gallery of images that scroll smoothly sideways inside the gallery. How would you build it? Can it be done without JS?

## Performance

36. A site uses a custom decorative font that hurts performance. Name all the ways to optimize it.
37. Imagine an old project in maintenance (not a JS stack, the backend on a PHP framework) handed over to you by another team. The task is to optimize its frontend as much as possible within the budget and 16 hours. Describe your strategy and steps within these limits.
38. How does preparing and including frontend assets differ depending on whether the server uses HTTP/1 or HTTP/2?
39. Are you familiar with setting a performance budget? How do you understand the concept?
40. What are DOM reflow, repaint and composite? How do they work?

## JavaScript

41. How do you go through an array of promises in parallel? And sequentially?
42. What is a `Symbol`? What is it used for in practice?
43. Give examples of the Observer pattern in the browser.
44. Give examples of scenarios that can lead to memory leaks in client-side code.
45. What is the difference between WebSockets and Server-Sent Events?
46. Tell us about Service Workers.
47. How do you work with WebSockets to implement two-way communication?
48. If an animation on a site is slow (low FPS), how do you find the cause? What causes are there?
49. Which ways of organizing code and which patterns do you use, and why?
50. What are the options for storing data on the client?
51. How would you implement caching on the client? When is it appropriate?
52. How do you implement authentication and authorization (if any) in your app? How do you take care of security and access rights on the client and on the server?
53. How do you use code splitting and lazy loading to optimize loading of pages and resources? How does it affect the app's performance?
54. How do you implement automated testing during development? Which tools do you use for unit, integration and interaction testing?
55. You need to pass data between two different websites. What are the ways to do it? What if it is client-side only? What if we have access to the code of both sites? What if one is shown inside the other in an iframe? What if we have no access to one of them?

## Frameworks and libraries

56. What was new in React 18?
57. How do you keep a reference to a function with up-to-date parameters without re-running `useEffect` needlessly?
58. What is the difference between `useLayoutEffect` and `useEffect`, and when do you use each?
59. Tell us about the `useTransition` hook.
60. Which React patterns do you know?
61. Give an example of the compound components pattern in React.
62. Do you need state management libraries if you have caching libraries (React Query, SWR) and React Context?
63. How do you handle errors in React components?
64. Explain what happens in this code and in which scenarios it can be useful:

    ```js
    const useHandler = (f) => {
      const ref = React.useRef(f);
      ref.current = f;
      return React.useCallback((...args) => ref.current(...args), []);
    };
    ```

65. How do you manage global state in Angular apps with ngrx/store?
66. How do you keep design and styling consistent across large React codebases? Which approaches or tools do you use to keep the UI unified?
67. How do you structure and organize components in large React apps? How do you split components logically, reuse them and keep the code maintainable?
68. How do you manage forms in React, including form libraries such as Formik or React Hook Form? How do you handle validation, input masks and other aspects of forms?
69. You need to render a large list (100k+ items). How would you do it?
70. Optimizing React components: what is worth doing and what is not? Should you use `useMemo` and `useCallback`, and when?
71. How do you build a React app?
72. Which state management tools have you used, and why did you choose them?
73. Do you use incremental static regeneration in Next.js to update static pages on a time interval or when data changes? How does it affect performance and caching?

## Testing

74. Do you have experience covering large systems with tests?
75. Do you have experience customizing test utilities for a project's needs?
76. How do you organize test data and make it fit different test scenarios?
77. How do you integrate testing into continuous integration and deployment?
78. How should testing be automated? Which tools and scripting languages do you use?
79. How do you keep test results consistent across environments (development, testing, production)?
80. How do you decide that a product is ready for release? Which "green light" criteria do you use?
81. Do you know chaos engineering? If so, how can it be applied to the frontend?

## Algorithms and data structures

82. Which non-trivial data structures have you worked with or do you know?
83. Tell us about CRDTs.
84. Which optimization algorithms have you used to improve the performance of large apps?
85. Which sorting algorithms do you consider the most efficient for large data sets?
86. How do you use dynamic programming in real projects? Give an example.
87. Tell us about practical uses of data structures such as AVL trees or red-black trees.
88. How can you implement a "deep freeze" of an object in JavaScript?
89. How can you serialize an object that contains circular references?
90. How can you implement a virtual DOM similar to React's?

## Architecture

91. By which characteristics would you choose a framework for a new project?
92. By which characteristics would you choose a UI library for a new project?
93. What are signals, and how are they implemented in different frameworks?
94. What are the pros and cons of a monorepo compared with separate repositories?
95. Describe the CI/CD process on your current project.
96. What is a microservice architecture, and what are its advantages over a monolith?
97. How would you design a system for high availability and scalability?
98. Which design patterns do you know, and where should they be applied?
99. What are the strategies for scaling web applications?
100. Tell us about single-page applications, their pros and cons.
101. Which architectural patterns for web apps have you used, and what are their advantages?
102. How should scalable, high-performance frontend systems be built?
103. Are you familiar with the micro-frontend architecture? Perhaps you know specific implementations?
104. How do you balance ready-made solutions against building your own? How should such decisions be made?

## Security

105. How do you take care of the security of web applications?
106. Explain how Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attacks work and how to protect against them.
107. What are the best practices for API security?
108. Tell us about protecting against SQL injection.
109. What is CORS and how do you configure it correctly?
110. How do you manage secrets in projects?
111. If you were asked to write a security checklist for a project, what would it look like?

## Accessibility

112. What is ARIA, and what are its main roles, states and properties?
113. Describe building an accessible modal dialog from scratch. What are the options, and what needs attention?
114. Do you know the specifics of web accessibility law in the countries of the main clients (the US, the EU, the UK, Canada, Ukraine)?
115. Imagine I am a client who knows nothing about accessibility and has never thought about it. Convince me why accessibility matters and why I should spend extra money on it.
