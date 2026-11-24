A big list of questions on React, React Router and Redux. Only the ones the earlier modules don't cover are here, and repeats of the same question are merged. Try to answer each one out loud, then check yourself in the quizzes after this slide: each question here has one matching quiz question.

## React

1. What are default props, and how do you set them?
2. How do you update state? When do you need the functional form `setCount(prev => prev + 1)`?
3. What are fragments in React?
4. How does React differ from ReactDOM? How do you render an app into the DOM?
5. How does conditional rendering work? What is the pitfall of the `&&` operator?
6. Why do lists need a `key` prop? What happens if you use the array index? Why `map()` and not `forEach()`?
7. What are component composition and the `children` prop?
8. What does the second argument of `useState` do?
9. What is lazy initialization of state in `useState`?
10. How do you avoid `bind` in class components?
11. How does `useRef` differ from `createRef`?
12. What is derived state, and why shouldn't you store it separately?
13. How do you keep state across page reloads?
14. What is `StrictMode`?
15. How does `React.PureComponent` differ from `React.Component`?
16. How do you handle several form fields with one handler?
17. What is the `useImperativeHandle` hook for?
18. What is Axios, and how does it differ from `fetch`?

## React Router

19. What types of routers are there (`BrowserRouter`, `HashRouter`, `MemoryRouter`), and when do you use each?
20. How does `<a>` differ from `<Link>`, and `<Link>` from `<NavLink>`?
21. How do you create a route with a parameter and read it?
22. How do you work with query parameters?
23. How do you navigate from code? What replaced `useHistory`, `withRouter` and `useRouteMatch`?
24. How does `<Switch>` differ from `<Routes>`? What happened to `exact`?
25. How do you redirect a user and build a protected route?
26. How do you handle a 404 page?

## Redux

27. How does a React component connect to Redux: `Provider`, `useSelector`, `useDispatch` and `connect`?
28. Why does immutability matter in Redux, and how does Redux Toolkit let you write "mutating" code?
29. What is Redux middleware? What are `redux-thunk` and `createAsyncThunk` for?
30. What are selectors and the Reselect library?
31. How do you combine several reducers?
32. What is Redux-Saga? How does the `call()` effect differ from `put()`?
33. What are Redux DevTools and time-travel debugging?
34. Can you dispatch an action inside a reducer?
35. How do you access the Redux store outside a React component?
36. How does Redux work with server-side rendering (SSR)?
37. How do you test reducers, actions and components that use hooks?

## React in depth

38. How does React differ from Vue.js in component architecture and reactivity?
39. How do you migrate a legacy app from class components to function components with hooks?
40. What is reconciliation in React, and how does it work under the hood? What is Fiber?
41. How does React use event delegation in its synthetic event system?
42. How do you find and fix the cause of excessive re-renders in a React app?
43. How do you find and fix a memory leak in a React app?
44. Tell us about a time you found and fixed a performance bottleneck in a frontend app. How do you structure that answer?
45. How do you write a test for a React component with React Testing Library, for example a counter with a button?
46. How do you test a component that loads data from an API: the loading, error and success states?
47. How do you build end-to-end tests for an app with several user roles?
48. How do you make a custom dropdown accessible to keyboard and screen reader users?
49. How do you test the accessibility of a React app, and what can and can't automated tools like axe do?
