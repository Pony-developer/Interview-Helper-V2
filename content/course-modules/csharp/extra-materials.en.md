Multithreading is a large topic, and the course gives only the foundations. For going further, these materials are a good next step:

- **The official Microsoft documentation** on managed threading, the `Task` class, `Parallel`, and `async`/`await`. Search for the topic names; the documentation is updated with each .NET version.
- **Joseph Albahari's free book "Threading in C#"**, which explains locks, thread safety, and the thread pool in depth, with many small examples.
- **Your own experiments.** Write a program that increments a counter from two threads, first without a lock and then with one, and watch the numbers. Nothing teaches race conditions faster than seeing one.

## Habits that prevent most bugs

- Make shared data **private**, and access it only through methods that take a lock.
- Prefer **immutable** data passed between threads: if nobody can change it, there is no race.
- Never block the UI thread; move long work away and return the result through a safe channel.
- Keep the locked code short, and never call unknown code (events, callbacks) while holding a lock.
- Use `async/await` and `Task` for I/O, and `Parallel` for CPU work on independent items.
