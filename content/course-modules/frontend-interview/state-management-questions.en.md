A list of questions on state management with Redux and Zustand. Only the ones the earlier modules don't cover are here: React-Redux hooks, Immer, thunks, Reselect, Redux-Saga effects, DevTools, testing reducers, normalization and choosing between Redux and Zustand are already in the React, System design and Senior modules. Try to answer each one out loud, then check yourself in the quizzes after this slide: each question here has one matching quiz question.

## Redux at scale

1. How do you structure a Redux store for a large app with several domains, such as user, product and cart?
2. How do you handle async actions in Redux? When do you pick Redux Thunk, and when Redux-Saga?
3. How do you keep Redux from causing unnecessary re-renders?
4. How do you keep a complex reducer, such as a multi-step wizard, predictable and testable?
5. How do you debug a Redux app when state changes unexpectedly?
6. How do you integrate Redux with TypeScript for type-safe actions, reducers and selectors?
7. How do you write Redux middleware for cross-cutting concerns such as logging, analytics or authentication?
8. How do you persist Redux state across page reloads or app restarts?
9. How do you migrate a legacy Redux app to modern Redux Toolkit?

## Zustand

10. How do you structure a Zustand store for an app with several features?
11. How do you handle async state updates in Zustand?
12. How do you integrate Zustand with TypeScript?
13. How do you persist Zustand state across sessions or tabs?
14. What is the real difference between Redux's immutable state and Zustand's supposedly "mutable" state?
15. How do you test state logic in Zustand, compared with Redux?
