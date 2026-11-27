import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const sliceTypes = (body: string) => `// A read-only view over part of a string: no copying, like ReadOnlySpan<char>.
struct Slice   // fields are readonly: an immutable view
{
    private readonly string _text;
    public readonly int Start;
    public readonly int Length;

    public Slice(string text) : this(text, 0, text.Length) { }
    public Slice(string text, int start, int length) { _text = text; Start = start; Length = length; }

    public char this[int i] { get { return _text[Start + i]; } }
    public override string ToString() { return _text.Substring(Start, Length); }   // the only allocation

    // A sub-view; no new string is created.
    public Slice Sub(int start, int length)
    {
${body.split("@@")[0]}
    }

    // Removes spaces at both ends, returning a narrower view.
    public Slice Trim()
    {
${body.split("@@")[1]}
    }

    // Parses a non-negative integer directly from the characters (no Substring, no int.Parse).
    // Returns false for an empty slice or any non-digit.
    public bool TryParseInt(out int value)
    {
${body.split("@@")[2]}
    }

    // Index of the first 'c' at or after 'from', or -1.
    public int IndexOf(char c, int from)
    {
        for (int i = from; i < Length; i++) if (this[i] == c) return i;
        return -1;
    }
}

static class Csv
{
    // Sums the 'column'-th field (0-based) of every line in 'text' using slices only.
    // Lines are separated by '\\n'; fields by ','; fields may have spaces around them; bad numbers are skipped.
    public static long SumColumn(string text, int column)
    {
${body.split("@@")[3]}
    }
}`;

const sliceSolution = [
  `        if (start < 0 || length < 0 || start + length > Length) throw new ArgumentOutOfRangeException();
        return new Slice(_text, Start + start, length);`,
  `        int s = 0, e = Length;
        while (s < e && this[s] == ' ') s++;
        while (e > s && this[e - 1] == ' ') e--;
        return Sub(s, e - s);`,
  `        value = 0;
        if (Length == 0) return false;
        for (int i = 0; i < Length; i++)
        {
            char ch = this[i];
            if (ch < '0' || ch > '9') { value = 0; return false; }
            value = value * 10 + (ch - '0');
        }
        return true;`,
  `        long sum = 0;
        var all = new Slice(text);
        int lineStart = 0;
        while (lineStart <= all.Length)
        {
            int nl = all.IndexOf('\\n', lineStart);
            int lineEnd = nl < 0 ? all.Length : nl;
            Slice line = all.Sub(lineStart, lineEnd - lineStart);
            int fieldStart = 0;
            for (int f = 0; f <= column; f++)
            {
                int comma = line.IndexOf(',', fieldStart);
                int fieldEnd = comma < 0 ? line.Length : comma;
                if (f == column)
                {
                    int v;
                    if (line.Sub(fieldStart, fieldEnd - fieldStart).Trim().TryParseInt(out v)) sum += v;
                }
                if (comma < 0) break;
                fieldStart = comma + 1;
            }
            if (nl < 0) break;
            lineStart = nl + 1;
        }
        return sum;`,
].join("@@");

const sliceMain = `        var s = new Slice("  order-42 ,  1500 ");
        Slice trimmed = s.Trim();
        Console.WriteLine("[" + trimmed + "] start=" + trimmed.Start + " length=" + trimmed.Length);
        Slice number = s.Sub(12, 6).Trim();
        int n;
        Console.WriteLine("[" + number + "] " + number.TryParseInt(out n) + " " + n);
        Console.WriteLine(new Slice("12a").TryParseInt(out n) + " " + n);
        Console.WriteLine(new Slice("").TryParseInt(out n));
        string csv = "pen, 10, 1\\nink,  2 , 7\\npad,x,4\\ncap, 30 ,2";
        Console.WriteLine("qty total: " + Csv.SumColumn(csv, 1));
        Console.WriteLine("price total: " + Csv.SumColumn(csv, 2));
        try { s.Sub(10, 50); } catch (ArgumentOutOfRangeException) { Console.WriteLine("out of range"); }`;

const poolTypes = (body: string) => `// A tiny ArrayPool<byte>: buffers are grouped in buckets by power-of-two size (16, 32, 64, ...).
// Rent(n) returns a buffer of at least n bytes (a reused one when available); Return(buffer) puts it back.
class BufferPool
{
    private readonly Dictionary<int, Stack<byte[]>> _buckets = new Dictionary<int, Stack<byte[]>>();
    public int Allocations { get; private set; }

    public static int BucketSize(int n)
    {
        int size = 16;
        while (size < n) size *= 2;
        return size;
    }

    public byte[] Rent(int minimumLength)
    {
${body.split("@@")[0]}
    }

    // Only buffers whose length is exactly a bucket size can be returned; others throw ArgumentException.
    // When 'clear' is true the buffer is zeroed first, so the next renter can't see old data.
    public void Return(byte[] buffer, bool clear = false)
    {
${body.split("@@")[1]}
    }
}`;

const poolSolution = `        int size = BucketSize(minimumLength);
        Stack<byte[]> bucket;
        if (_buckets.TryGetValue(size, out bucket) && bucket.Count > 0) return bucket.Pop();
        Allocations++;
        return new byte[size];@@        if (buffer.Length != BucketSize(buffer.Length)) throw new ArgumentException("Buffer is not from this pool");
        if (clear) Array.Clear(buffer, 0, buffer.Length);
        Stack<byte[]> bucket;
        if (!_buckets.TryGetValue(buffer.Length, out bucket)) _buckets[buffer.Length] = bucket = new Stack<byte[]>();
        bucket.Push(buffer);`;

const poolMain = `        var pool = new BufferPool();
        for (int i = 0; i < 1000; i++)
        {
            byte[] buf = pool.Rent(100);          // a 128-byte buffer
            buf[0] = (byte)i;
            pool.Return(buf);
        }
        Console.WriteLine("1000 rents of 100 bytes -> allocations: " + pool.Allocations);

        byte[] a = pool.Rent(10), b = pool.Rent(10);
        Console.WriteLine("sizes: " + a.Length + ", " + pool.Rent(17).Length + ", " + pool.Rent(1000).Length);
        Console.WriteLine("distinct while both rented: " + !ReferenceEquals(a, b));

        a[5] = 42;
        pool.Return(a);
        Console.WriteLine("dirty reuse: " + pool.Rent(16)[5]);
        byte[] c = pool.Rent(16);
        c[5] = 42;
        pool.Return(c, clear: true);
        Console.WriteLine("cleared reuse: " + pool.Rent(16)[5]);
        try { pool.Return(new byte[100]); } catch (ArgumentException e) { Console.WriteLine(e.Message); }
        Console.WriteLine("allocations: " + pool.Allocations);`;

export const spanMemoryModule: ModuleDef = {
  slug: "span-memory",
  title: { en: "Span<T> and Memory<T>", uk: "Span<T> і Memory<T>" },
  slides: [
    lecture("spans-slicing", "Span<T>: safe views over memory", "Span<T>: безпечні представлення пам'яті"),
    lecture("memory-t", "Memory<T>, ReadOnlyMemory<T> and async code", "Memory<T>, ReadOnlyMemory<T> і асинхронний код"),
    lecture("span-parsing", "Forward-only parsing with spans", "Розбір лише вперед за допомогою спанів"),
    lecture("stackalloc-pools", "stackalloc, ArrayPool and unmanaged memory", "stackalloc, ArrayPool і некерована пам'ять"),
    quiz("span-memory-quiz", "Span<T> and Memory<T>", "Span<T> і Memory<T>", [
      question(
        "span-what",
        ["What is `Span<T>`?", "Що таке `Span<T>`?"],
        [
          ["A new kind of array that copies data", "Новий вид масиву, що копіює дані"],
          ["A type-safe view over a contiguous region of memory (array, stack or native) that slices without copying", "Типобезпечне представлення неперервної ділянки пам'яті (масиву, стеку чи нативної), що нарізається без копіювання"],
          ["A thread-safe list", "Потокобезпечний список"],
          ["A pointer type that requires unsafe code", "Тип вказівника, що вимагає unsafe-коду"],
        ],
        "b",
      ),
      question(
        "span-restrictions",
        ["Why can't a `Span<T>` be a field of a class or used across an `await`?", "Чому `Span<T>` не може бути полем класу чи використовуватися через `await`?"],
        [
          ["It's too big", "Він завеликий"],
          ["It's a `ref struct`: it may point to stack memory, so it must never escape to the heap", "Це `ref struct`: він може вказувати на стекову пам'ять, тож ніколи не має потрапити в купу"],
          ["It isn't thread-safe", "Він не потокобезпечний"],
          ["It's obsolete", "Він застарів"],
        ],
        "b",
      ),
      question(
        "memory",
        ["When do you need `Memory<T>` instead of `Span<T>`?", "Коли потрібен `Memory<T>` замість `Span<T>`?"],
        [
          ["Never", "Ніколи"],
          ["For stack-allocated buffers", "Для буферів у стеку"],
          ["When the buffer must be stored in a field, captured in a lambda or used across await (async methods take Memory<T>)", "Коли буфер треба зберегти в полі, захопити в лямбді чи використати через await (асинхронні методи приймають Memory<T>)"],
          ["For faster element access", "Для швидшого доступу до елементів"],
        ],
        "c",
      ),
      question(
        "substring",
        ["Why is `text.AsSpan(5, 3)` cheaper than `text.Substring(5, 3)`?", "Чому `text.AsSpan(5, 3)` дешевший за `text.Substring(5, 3)`?"],
        [
          ["It isn't", "Він не дешевший"],
          ["It caches the result", "Він кешує результат"],
          ["It runs on another thread", "Він виконується в іншому потоці"],
          ["It allocates nothing: it's a view over the original string's characters, while Substring creates a new string", "Він нічого не алокує: це представлення символів початкового рядка, а Substring створює новий рядок"],
        ],
        "d",
      ),
      question(
        "stackalloc",
        ["Which are true about `Span<byte> buf = stackalloc byte[256];`?", "Що правда про `Span<byte> buf = stackalloc byte[256];`?"],
        [
          ["It needs no `unsafe` block when assigned to a Span", "Він не потребує блоку `unsafe`, коли присвоюється Span"],
          ["The memory is freed automatically when the method returns", "Пам'ять звільняється автоматично, коли метод повертається"],
          ["Large sizes risk a StackOverflowException, so keep it small or fall back to ArrayPool", "Великі розміри ризикують StackOverflowException, тож тримайте його невеликим або переходьте на ArrayPool"],
          ["It is garbage-collected", "Його збирає GC"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "arraypool",
        ["What is the main rule when using `ArrayPool<T>.Shared.Rent(n)`?", "Яке головне правило при використанні `ArrayPool<T>.Shared.Rent(n)`?"],
        [
          ["The array is exactly n long", "Масив має рівно n елементів"],
          ["The array may be longer than n and may contain old data; always Return it (in finally) and never use it afterwards", "Масив може бути довшим за n і містити старі дані; завжди повертайте його (у finally) і ніколи не використовуйте після цього"],
          ["You must call Dispose on it", "На ньому треба викликати Dispose"],
          ["It's only for strings", "Він лише для рядків"],
        ],
        "b",
      ),
      question(
        "readonlyspan-string",
        ["`ReadOnlySpan<char> s = \"hello\";` Can you modify the characters through `s`?", "`ReadOnlySpan<char> s = \"hello\";` Чи можна змінити символи через `s`?"],
        [
          ["No: strings are immutable and the read-only span prevents writes", "Ні: рядки незмінні, а span лише для читання забороняє запис"],
          ["Yes", "Так"],
          ["Only with unsafe", "Лише з unsafe"],
          ["It doesn't compile", "Не компілюється"],
        ],
        "a",
      ),
      question(
        "list-span",
        ["How do you get a `Span<T>` over a `List<T>`'s items in .NET 5+?", "Як у .NET 5+ отримати `Span<T>` над елементами `List<T>`?"],
        [
          ["`list.AsSpan()`", "`list.AsSpan()`"],
          ["`new Span<T>(list)`", "`new Span<T>(list)`"],
          ["It's impossible", "Це неможливо"],
          ["`CollectionsMarshal.AsSpan(list)`, valid only while the list isn't resized", "`CollectionsMarshal.AsSpan(list)`, дійсний лише поки список не змінює розмір"],
        ],
        "d",
      ),
    ]),
    practice("slice-parsing-practice", "Zero-copy parsing with a slice struct", "Розбір без копіювання через структуру-зріз", {
      starter: PROGRAM_WITH(sliceTypes(`${TODO}@@${TODO}@@${TODO}@@${TODO}`), sliceMain),
      solution: PROGRAM_WITH(sliceTypes(sliceSolution), sliceMain),
      expectedOutput:
        "[order-42 ,  1500] start=2 length=16\n[1500] True 1500\nFalse 0\nFalse\nqty total: 42\nprice total: 14\nout of range\n",
    }),
    practice("buffer-pool-practice", "A buffer pool like ArrayPool", "Пул буферів на кшталт ArrayPool", {
      starter: PROGRAM_WITH(poolTypes(`${TODO}@@${TODO}`), poolMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(poolTypes(poolSolution), poolMain, "using System.Collections.Generic;"),
      expectedOutput:
        "1000 rents of 100 bytes -> allocations: 1\nsizes: 16, 32, 1024\ndistinct while both rented: True\ndirty reuse: 42\ncleared reuse: 0\nBuffer is not from this pool\nallocations: 6\n",
    }),
  ],
};
