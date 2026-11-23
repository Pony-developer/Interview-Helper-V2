A thinking AI is slow, so it runs on its own thread, and the main program keeps going. The method `Think(int seed)` is ready: it stands for a slow computation, and it returns `seed * seed * 100`. Write the class `ThinkingThread`, which runs `Think` on a new thread:

- `Start()`: creates a `Thread` that runs the method `Work`, and starts it;
- `Work()`: computes `Program.Think(seed)` and stores the result. Store it, and set `done` to `true`, **both under the same lock**, so that another thread never sees one without the other;
- `Wait()`: waits for the thread to finish (`Join`). If the thread was never started, do nothing;
- `Result`: the stored result, read under the lock;
- `Done`: `true` once the work has finished, read under the lock.

Do not change `Main`. Expected output:

```text
900
2500
True
False
```

The lines in order: the result of the thread for seed `3` (`3 * 3 * 100`); the result for seed `5`; `True` because both threads are done after waiting; and `False` for a thread that was never started.

Hint: `new Thread(Work)` is enough to create the thread. The lock is `sync`, an object that is already declared for you.
