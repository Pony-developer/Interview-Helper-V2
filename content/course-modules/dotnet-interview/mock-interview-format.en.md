The DOU article includes a note on how a backend interview is usually structured. Knowing the shape of the conversation helps you prepare and pace yourself.

## A typical technical interview (60–90 minutes)

| Part | Time | What happens |
|---|---|---|
| Introductions | 5 min | The team and the role; you summarize your experience in 1–2 minutes |
| Experience deep dive | 10–15 min | Your last project: architecture, your role, a hard problem (STAR) |
| Fundamentals | 15–25 min | C# and .NET: types, memory, async, collections, LINQ — the questions from this course |
| Backend topics | 10–20 min | ASP.NET Core, databases and ORMs, security, distributed systems, cloud — deeper at Middle/Senior |
| Practical task | 15–30 min | Live coding, code review of a snippet, or a design question |
| Your questions | 5–10 min | Ask about the team, process, codebase and challenges |

Seniors get more system design and architecture, fewer trivia questions; Juniors get more fundamentals and a simpler coding task.

## How you're evaluated

- **Depth over breadth**: one answer explained to the level of "why" beats ten memorized definitions.
- **Reasoning out loud**: trade-offs, alternatives, what you'd measure.
- **Honesty**: "I haven't used it, but I'd expect it to work like X because Y" is a good answer; bluffing is a red flag.
- **Experience**: real examples of bugs you fixed and decisions you made.
- **Communication**: structured answers — short answer first, then details, then an example.

## Answer structure that works

1. **Direct answer** in one or two sentences.
2. **How it works** (one level deeper).
3. **When it matters / a pitfall** from practice.
4. Stop and let the interviewer steer — they'll ask for more if they want it.

Example: *"What's the difference between `IEnumerable` and `IQueryable`?"* — "IQueryable builds an expression tree that a provider like EF Core translates to SQL, so filtering runs in the database; IEnumerable runs delegates in memory. The pitfall is calling `AsEnumerable` or `ToList` too early — then you pull the whole table. I once found a report that loaded 2 million rows that way…"

## Before the interview

- Re-read the job description and map each requirement to a story from your experience.
- Prepare 3 project stories (a hard bug, a design decision, a conflict or failure) in STAR form.
- Practise saying answers out loud — the quizzes check knowledge, not delivery.
- Prepare questions: how do you deploy? how do you review code? what's the biggest technical challenge this year? how is on-call organized?

## The next lectures

Each mock interview below is a scripted conversation at one level, with strong answers and notes on what the interviewer is checking. Read the question, answer it yourself first, then compare. After each mock there's a mixed final exam for that level.
