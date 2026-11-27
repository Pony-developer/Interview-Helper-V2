import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const binaryTypes = (body: string) => `class Reading
{
    public string Sensor;
    public DateTime Time;     // stored as ticks
    public double Value;
    public bool Alarm;
}

// File format: the 4 bytes "SNS1", an int32 count, then for each reading:
// string Sensor (BinaryWriter's length-prefixed string), int64 Time.Ticks, double Value, bool Alarm.
static class ReadingFile
{
    public static void Write(Stream stream, IList<Reading> readings)
    {
${body.split("@@")[0]}
    }

    // Throws InvalidDataException("Not a sensor file") if the header is wrong.
    public static List<Reading> Read(Stream stream)
    {
${body.split("@@")[1]}
    }
}`;

const binarySolution = `        using (var w = new BinaryWriter(stream, Encoding.UTF8, leaveOpen: true))
        {
            w.Write(Encoding.ASCII.GetBytes("SNS1"));
            w.Write(readings.Count);
            foreach (var r in readings)
            {
                w.Write(r.Sensor);
                w.Write(r.Time.Ticks);
                w.Write(r.Value);
                w.Write(r.Alarm);
            }
        }@@        using (var rd = new BinaryReader(stream, Encoding.UTF8, leaveOpen: true))
        {
            byte[] magic = rd.ReadBytes(4);
            if (magic.Length != 4 || Encoding.ASCII.GetString(magic) != "SNS1")
                throw new InvalidDataException("Not a sensor file");
            int count = rd.ReadInt32();
            var list = new List<Reading>(count);
            for (int i = 0; i < count; i++)
            {
                list.Add(new Reading
                {
                    Sensor = rd.ReadString(),
                    Time = new DateTime(rd.ReadInt64()),
                    Value = rd.ReadDouble(),
                    Alarm = rd.ReadBoolean(),
                });
            }
            return list;
        }`;

const binaryMain = `        var data = new List<Reading>
        {
            new Reading { Sensor = "temp-1", Time = new DateTime(2024, 3, 5, 10, 0, 0), Value = 21.5, Alarm = false },
            new Reading { Sensor = "temp-2", Time = new DateTime(2024, 3, 5, 10, 0, 5), Value = 87.25, Alarm = true },
            new Reading { Sensor = "датчик-3", Time = new DateTime(2024, 3, 5, 10, 1, 0), Value = -4, Alarm = false },
        };
        var ms = new MemoryStream();
        ReadingFile.Write(ms, data);
        Console.WriteLine("bytes: " + ms.Length + ", position: " + ms.Position);
        ms.Position = 0;
        foreach (var r in ReadingFile.Read(ms))
            Console.WriteLine(r.Sensor + " " + r.Time.ToString("HH:mm:ss") + " " + r.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) + (r.Alarm ? " ALARM" : ""));
        Console.WriteLine("stream still open: " + ms.CanRead);
        try { ReadingFile.Read(new MemoryStream(Encoding.ASCII.GetBytes("JUNKJUNK"))); }
        catch (InvalidDataException e) { Console.WriteLine(e.Message); }`;

const pipelineTypes = (body: string) => `static class TextPipeline
{
    // Writes the lines as UTF-8 text through a GZipStream into 'output', leaving 'output' open.
    public static void Compress(Stream output, IEnumerable<string> lines)
    {
${body.split("@@")[0]}
    }

    // Reads gzip-compressed UTF-8 text from 'input' line by line, without loading it all,
    // and returns how many lines contain 'word' (case-insensitive).
    public static int CountLinesContaining(Stream input, string word)
    {
${body.split("@@")[1]}
    }
}`;

const pipelineSolution = `        using (var gzip = new GZipStream(output, CompressionMode.Compress, leaveOpen: true))
        using (var writer = new StreamWriter(gzip, new UTF8Encoding(false)))
        {
            foreach (var line in lines) writer.WriteLine(line);
        }@@        int count = 0;
        using (var gzip = new GZipStream(input, CompressionMode.Decompress, leaveOpen: true))
        using (var reader = new StreamReader(gzip, Encoding.UTF8))
        {
            string line;
            while ((line = reader.ReadLine()) != null)
                if (line.IndexOf(word, StringComparison.OrdinalIgnoreCase) >= 0) count++;
        }
        return count;`;

const pipelineMain = `        var lines = new List<string>();
        for (int i = 1; i <= 2000; i++)
            lines.Add(i % 10 == 0 ? "ERROR request " + i + " failed" : "INFO request " + i + " ok");
        int rawSize = Encoding.UTF8.GetByteCount(string.Join("\\n", lines) + "\\n");

        var compressed = new MemoryStream();
        TextPipeline.Compress(compressed, lines);
        Console.WriteLine("compressed smaller: " + (compressed.Length < rawSize / 4));
        Console.WriteLine("output still usable: " + compressed.CanWrite);

        compressed.Position = 0;
        Console.WriteLine("errors: " + TextPipeline.CountLinesContaining(compressed, "error"));
        compressed.Position = 0;
        Console.WriteLine("request 1999: " + TextPipeline.CountLinesContaining(compressed, "request 1999 "));`;

export const streamsIoModule: ModuleDef = {
  slug: "streams-io",
  title: { en: "Streams and I/O", uk: "Потоки даних і введення-виведення" },
  slides: [
    lecture("stream-architecture", "Stream architecture: backing stores and decorators", "Архітектура потоків: сховища та декоратори"),
    lecture("stream-adapters", "Stream adapters: text and binary readers and writers", "Адаптери потоків: текстові та двійкові читачі й писачі"),
    lecture("compression-zip", "Compression and ZIP files", "Стиснення та ZIP-файли"),
    lecture("files-directories", "Files, directories, paths and file watching", "Файли, каталоги, шляхи та стеження за файлами"),
    lecture("memory-mapped-files", "Memory-mapped files and OS security", "Файли, відображені в пам'ять, і безпека ОС"),
    quiz("streams-io-quiz", "Streams and I/O", "Потоки даних і введення-виведення", [
      question(
        "decorator",
        ["What role does `BufferedStream` or `GZipStream` play in the stream architecture?", "Яку роль у архітектурі потоків відіграє `BufferedStream` чи `GZipStream`?"],
        [
          ["A backing store", "Сховища"],
          ["A decorator: it wraps another stream and transforms or buffers the bytes passing through", "Декоратора: обгортає інший потік і перетворює чи буферизує байти, що через нього проходять"],
          ["An adapter that turns bytes into text", "Адаптера, що перетворює байти на текст"],
          ["A file system watcher", "Спостерігача за файловою системою"],
        ],
        "b",
      ),
      question(
        "read-count",
        ["`int n = stream.Read(buffer, 0, 4096);` What can you assume about `n`?", "`int n = stream.Read(buffer, 0, 4096);` Що можна припускати про `n`?"],
        [
          ["It is always 4096 unless the stream ended", "Завжди 4096, якщо потік не закінчився"],
          ["It is always at least 1", "Завжди принаймні 1"],
          ["It can be anything from 1 to 4096 while data remains; 0 means end of stream. Loop until you have what you need (or use ReadExactly in .NET 7)", "Будь-що від 1 до 4096, поки є дані; 0 означає кінець потоку. Читайте в циклі, доки не отримаєте потрібне (або ReadExactly в .NET 7)"],
          ["It is the file size", "Це розмір файлу"],
        ],
        "c",
      ),
      question(
        "dispose-adapter",
        ["You dispose a `StreamWriter` that wraps a `FileStream`. What happens to the FileStream?", "Ви звільняєте `StreamWriter`, що обгортає `FileStream`. Що станеться з FileStream?"],
        [
          ["It is flushed and disposed too, unless the writer was created with `leaveOpen: true`", "Його теж буде скинуто й звільнено, якщо writer не створено з `leaveOpen: true`"],
          ["Nothing", "Нічого"],
          ["It is flushed but stays open", "Його буде скинуто, але він лишиться відкритим"],
          ["It throws", "Кидає виняток"],
        ],
        "a",
      ),
      question(
        "flush",
        ["Why can a file written with `StreamWriter` end up empty or truncated?", "Чому файл, записаний через `StreamWriter`, може виявитися порожнім чи обрізаним?"],
        [
          ["StreamWriter is buggy", "У StreamWriter помилки"],
          ["Text files can't be larger than 4 KB", "Текстові файли не можуть бути більші за 4 КБ"],
          ["The encoding is wrong", "Неправильне кодування"],
          ["The writer buffers data; if it's never flushed or disposed, the last buffer isn't written", "Writer буферизує дані; якщо його ніколи не скинули чи не звільнили, останній буфер не записується"],
        ],
        "d",
      ),
      question(
        "path-combine",
        ["Which is the correct way to build a file path portably?", "Як правильно й переносно будувати шлях до файлу?"],
        [
          ["`dir + \"\\\\\" + name`", "`dir + \"\\\\\" + name`"],
          ["`Path.Combine(dir, name)` (or `Path.Join`)", "`Path.Combine(dir, name)` (або `Path.Join`)"],
          ["`$\"{dir}/{name}\"` everywhere", "`$\"{dir}/{name}\"` скрізь"],
          ["`string.Concat(dir, name)`", "`string.Concat(dir, name)`"],
        ],
        "b",
      ),
      question(
        "compression",
        ["Which are true about .NET compression streams?", "Що правда про потоки стиснення в .NET?"],
        [
          ["`GZipStream` and `DeflateStream` use the same algorithm; GZip adds a header and checksum", "`GZipStream` і `DeflateStream` використовують той самий алгоритм; GZip додає заголовок і контрольну суму"],
          ["`BrotliStream` usually compresses text better than GZip", "`BrotliStream` зазвичай стискає текст краще за GZip"],
          ["You must dispose (or flush) the compressing stream to write the final block", "Потік стиснення треба звільнити (чи скинути), щоб записати фінальний блок"],
          ["Compression streams are seekable", "Потоки стиснення підтримують Seek"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "filewatcher",
        ["What should you keep in mind about `FileSystemWatcher`?", "Що варто пам'ятати про `FileSystemWatcher`?"],
        [
          ["It raises exactly one event per change", "Він видає рівно одну подію на зміну"],
          ["It works only on Windows", "Він працює лише в Windows"],
          ["It can raise several events for one save, miss events when its buffer overflows, and fire before the writer has closed the file", "Він може видати кілька подій на одне збереження, пропустити події при переповненні буфера й спрацювати до того, як писач закрив файл"],
          ["It locks the watched directory", "Він блокує каталог, за яким стежить"],
        ],
        "c",
      ),
      question(
        "mmf",
        ["What is a memory-mapped file good for?", "Для чого добре підходить файл, відображений у пам'ять?"],
        [
          ["Random access to very large files, and sharing memory between processes", "Довільний доступ до дуже великих файлів і спільна пам'ять між процесами"],
          ["Compressing files", "Стиснення файлів"],
          ["Encrypting files", "Шифрування файлів"],
          ["Watching files for changes", "Стеження за змінами файлів"],
        ],
        "a",
      ),
    ]),
    practice("binary-format-practice", "A binary file format with BinaryWriter", "Двійковий формат файлу через BinaryWriter", {
      starter: PROGRAM_WITH(binaryTypes(`${TODO}@@${TODO}`), binaryMain, "using System.Collections.Generic;\nusing System.IO;\nusing System.Text;"),
      solution: PROGRAM_WITH(binaryTypes(binarySolution), binaryMain, "using System.Collections.Generic;\nusing System.IO;\nusing System.Text;"),
      expectedOutput:
        "bytes: 88, position: 88\ntemp-1 10:00:00 21.5\ntemp-2 10:00:05 87.25 ALARM\nдатчик-3 10:01:00 -4\nstream still open: True\nNot a sensor file\n",
    }),
    practice("gzip-pipeline-practice", "A compressed text pipeline", "Конвеєр стисненого тексту", {
      starter: PROGRAM_WITH(pipelineTypes(`${TODO}@@${TODO}`), pipelineMain, "using System.Collections.Generic;\nusing System.IO;\nusing System.IO.Compression;\nusing System.Text;"),
      solution: PROGRAM_WITH(pipelineTypes(pipelineSolution), pipelineMain, "using System.Collections.Generic;\nusing System.IO;\nusing System.IO.Compression;\nusing System.Text;"),
      expectedOutput: "compressed smaller: True\noutput still usable: True\nerrors: 200\nrequest 1999: 1\n",
    }),
  ],
};
