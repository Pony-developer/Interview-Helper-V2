So far we compared individual algorithms. **Complexity theory** goes further and sorts whole **problems** into classes, by how hard it is to solve them with the best possible algorithm.

## Easy, hard and impossible

Think of three groups of problems:

1. **Easy**: they have an algorithm that stays fast as the input grows. Sorting, searching, finding the shortest route.
2. **Hard**: the only known algorithms need exponential time. Visiting all the cities by the shortest tour, or packing a knapsack optimally.
3. **Impossible**: no algorithm exists at all. The famous example is the **halting problem**: there can be no program that can tell, for every program and every input, whether the program ever stops.

This lecture is about the border between the first two groups.

## The class P

**P** is the class of problems that can be **solved** in **polynomial** time, that is, in O(nᵏ) for some fixed `k`: n, n log n, n², n³, ...

Examples: sorting, searching in a sorted array, finding the shortest path in a graph, checking whether a number is prime (a polynomial algorithm was found in 2002), finding the greatest common divisor, multiplying matrices.

P is a model of "**feasible**" problems: the time grows reasonably.

## The class NP

**NP** is the class of problems whose solution can be **checked** in polynomial time, even if no one knows how to **find** it fast.

Take a **Sudoku**:

- *finding* the solution may need a lot of search;
- *checking* a given solution is trivial: look at every row, column and square once.

Another example, **subset sum**: given the numbers `3, 34, 4, 12, 5, 2`, is there a subset with the sum 9? Finding it means searching through up to 2ⁿ subsets. Checking the proposed answer `{4, 5}` takes a moment.

Every problem in P is also in NP (if you can solve it fast, you can check it fast). The name stands for "non-deterministic polynomial", not "not polynomial".

## P versus NP

Is every problem whose solution is easy to check also easy to solve? That is, **does P = NP**? It is the best known open question in computer science, and one of the seven Millennium Prize Problems, with a prize of one million dollars. Most experts believe the answer is **no**, but no one has been able to prove it.

## NP-complete problems

Among the problems in NP, some are the **hardest**: if you found a fast algorithm for any one of them, you could solve **all** of NP fast. They are called **NP-complete**. Hundreds of such problems are known, and they appear everywhere:

| Problem | The task |
| --- | --- |
| **Travelling salesman** (the decision version) | is there a tour of all the cities that is shorter than `L`? |
| **Subset sum** / **knapsack** | can some items be chosen to reach a given sum or value within a limit? |
| **Boolean satisfiability (SAT)** | can the variables of a logical formula be set so that it is true? |
| **Graph colouring** | can a graph be coloured with `k` colours, so that neighbours differ? |
| **Hamiltonian path** | is there a route that visits every vertex exactly once? |
| **Partition** | can a set of numbers be split into two parts with equal sums? |

**NP-hard** is a wider group: problems at least as hard as the NP-complete ones, even if their answers are not just "yes or no" (the *shortest* tour, not "is there a tour shorter than L").

## Why it matters to you

When you meet a new task, it is useful to recognise that it is one of the hard ones:

- If the only idea you have is to **try everything**, count how many options there are. All the orders of `n` items are n!, and all the subsets are 2ⁿ. For `n = 20`, that is 2.4 · 10¹⁸ and 10⁶ respectively.
- If the task looks like one of the NP-complete problems, **do not look for a fast exact algorithm for large inputs**. It would be a major discovery.

## What to do with a hard problem

1. **Check the size.** For small `n`, exponential algorithms are fine (see the table in the lecture on growth).
2. **Find structure.** Many instances are special: a graph that is a tree, numbers that are small, an input that is almost sorted. Special cases are often easy. Knapsack with small weights has a polynomial-in-the-weights solution by dynamic programming.
3. **Prune the search.** Backtracking and branch-and-bound cut off hopeless branches early.
4. **Approximate.** Accept an answer that is guaranteed to be within, say, 50% of the best. For some problems, a good approximation can be found quickly.
5. **Use heuristics.** Greedy rules, local search, genetic algorithms, simulated annealing: fast, with no guarantee, but often very good.
6. **Use a solver.** Powerful SAT and constraint solvers handle surprisingly big instances in practice.

## A map of the classes

| Complexity | Typical examples | Feasible for large n? |
| --- | --- | --- |
| O(1) | array access, dictionary lookup | yes |
| O(log n) | binary search | yes |
| O(n) | scan, sum, maximum | yes |
| O(n log n) | an efficient sort | yes |
| O(n²) | every pair; simple sorts | up to about 10⁴ or 10⁵ |
| O(n³) | naive matrix multiplication | up to about 10³ |
| O(2ⁿ) | all the subsets; subset sum by brute force | up to about 25 |
| O(n!) | all the orders; travelling salesman by brute force | up to about 10 |

Everything down to O(n³) is **polynomial**: P. The last two lines are where the NP-complete problems live, when solved by brute force.

## A word of caution

"Polynomial" does not always mean "fast": an algorithm with n¹⁰⁰ steps is polynomial and useless. And "exponential" does not always mean "slow": for small inputs, 2ⁿ may be perfectly fine. The classes describe how the cost **behaves in the limit**. In practice you also need the real constants, and the real sizes of your data.
