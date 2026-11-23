`Downloader.DownloadAsync(id)` simulates a download: it waits a moment and returns `id * 10`. The downloader also remembers the largest number of downloads that ran at the same time, `MaxRunning`.

Right now `DownloadAllAsync` starts every download at once, which would overload a real server. Change it so that **at most `maxParallel`** downloads run at the same time:

- create a `SemaphoreSlim` with `maxParallel` places;
- before each download, `await` the semaphore's `WaitAsync()`;
- after the download, `Release()` the place in a `finally` block, so that a failed download does not lose it;
- still start all the tasks first and wait for them with `Task.WhenAll`, so that the results stay in the order of the ids.

Do not change `Main` or `Downloader`. Expected output:

```text
10 20 30 40 50 60 70 80 90 100
Max at once: 3
Max at once: 1
```

Hint: an `async` lambda inside `Select` makes one task per id: `ids.Select(async id => { ... })`.
