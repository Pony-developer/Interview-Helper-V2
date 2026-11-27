A scripted Junior interview built from the DOU questions. Cover the answer, try it yourself, then compare.

---

**Interviewer:** Tell me about yourself in a minute.

**Candidate:** "I finished a two-year course in C# and built a pet project: a booking API on ASP.NET Core with EF Core and PostgreSQL, covered with xUnit tests and deployed in Docker. Before that I did six months of QA, so I'm used to writing test cases and reading logs. I'm looking for a team where I can grow on real backend work."

> *Checks:* clarity, relevance, something concrete to dig into later.

---

**Interviewer:** What are the principles of OOP? Give an example from your project.

**Candidate:** "Encapsulation, inheritance, polymorphism and abstraction. In my booking API, `Booking` has a private setter for `Status` and methods `Confirm()` and `Cancel()` that check the allowed transitions — that's encapsulation. Notifications go through an `INotifier` interface with email and SMS implementations — abstraction and polymorphism. I used inheritance less; I prefer composition unless it's a true 'is-a'."

> *Checks:* definitions plus a real example; bonus for "composition over inheritance".

---

**Interviewer:** Value types and reference types — where do they live? Is `string` a value type?

**Candidate:** "Value types hold the data; assignment copies it. Reference types hold a reference to an object on the heap. A local `int` is on the stack, but an `int` field of a class is on the heap inside the object, so 'value types live on the stack' is a simplification. `string` is a reference type, but it's immutable and `==` compares contents, so it behaves like a value."

---

**Interviewer:** What does this print? `var list = new List<int> { 1, 2 }; var q = list.Where(x => x > 1); list.Add(3); Console.WriteLine(q.Count());`

**Candidate:** "2. `Where` is deferred, so it runs during `Count()` and sees the 3 that was added."

> *Checks:* deferred execution — a very common trap.

---

**Interviewer:** What's the complexity of finding an item in a `List` and in a `HashSet`?

**Candidate:** "O(n) for `List.Contains` — it scans; O(1) on average for `HashSet` — it hashes to a bucket. If I check membership in a loop, I'd convert to a `HashSet` first, otherwise it's O(n²)."

---

**Interviewer:** `async`/`await` — what does `await` actually do?

**Candidate:** "If the task isn't finished, the method returns to its caller and the rest of the method is scheduled as a continuation; the thread isn't blocked. For I/O no thread waits at all. So in a web API the thread goes back to the pool and can serve other requests. And I shouldn't use `.Result` — it blocks and can deadlock."

---

**Interviewer:** Which JOIN returns all customers, even those without orders?

**Candidate:** "`LEFT JOIN orders`. And to count their orders correctly I'd use `count(o.id)`, not `count(*)`, so customers without orders get 0."

---

**Interviewer:** Why write unit tests? What does a test look like?

**Candidate:** "To catch regressions quickly and refactor safely. A test has Arrange, Act, Assert. For example, `Cancel_after_check_in_throws`: arrange a booking with status `CheckedIn`, act by calling `Cancel()`, assert that `InvalidOperationException` is thrown."

---

**Interviewer:** Practical task: check whether a number is prime.

**Candidate (thinking aloud):** "Numbers below 2 aren't prime, 2 is, other even numbers aren't. Then I check odd divisors up to the square root — if `n` has a divisor larger than √n, it also has one smaller. Complexity O(√n). I'll write `d * d <= n` with `long` to avoid overflow near `int.MaxValue`."

```csharp
static bool IsPrime(int n)
{
    if (n < 2) return false;
    if (n % 2 == 0) return n == 2;
    for (long d = 3; d * d <= n; d += 2)
        if (n % d == 0) return false;
    return true;
}
```

"Tests I'd run: −1, 0, 1, 2, 3, 4, 9, 97, `int.MaxValue`."

> *Checks:* edge cases first, complexity, overflow awareness, testing by hand.

---

**Interviewer:** Do you have questions for us?

**Candidate:** "How is code review organized? What would my first month look like? How do you test and deploy?"

## Debrief

A strong Junior answers briefly and correctly, gives concrete examples, knows the classic traps (deferred LINQ, value/reference copies, `.Result`), and codes carefully with edge cases. The exam after this lecture mixes questions from all Junior sections.
