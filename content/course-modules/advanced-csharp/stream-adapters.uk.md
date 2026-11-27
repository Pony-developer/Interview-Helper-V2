## Текстові адаптери

`TextReader`/`TextWriter` — абстрактні класи для читання й запису символів. Основні реалізації:

| Тип | Читає/пише |
| --- | --- |
| `StreamReader` / `StreamWriter` | текст поверх `Stream` з `Encoding` |
| `StringReader` / `StringWriter` | текст поверх `string` / `StringBuilder` |

```csharp
using (var writer = new StreamWriter("orders.csv", append: false, Encoding.UTF8))
{
    writer.WriteLine("id,total");
    writer.WriteLine($"{42},{99.5m.ToString(CultureInfo.InvariantCulture)}");
}

using (var reader = new StreamReader("orders.csv"))
{
    string? line;
    while ((line = reader.ReadLine()) != null) Process(line);
}

foreach (string line in File.ReadLines("big.log")) { }   // ліниво, потоково
string all = File.ReadAllText("small.json");             // увесь файл одразу
```

`StreamReader` за BOM визначає кодування; інакше бере передане (за замовчуванням UTF-8). `ReadLine` розуміє `\n`, `\r\n` і `\r`. `File.ReadLines` читає рядок за рядком; `File.ReadAllLines` вантажить усе в масив.

`StringWriter`/`StringReader` зручні для тестування коду, що приймає `TextWriter`/`TextReader`, як-от генератора звітів.

## Двійкові адаптери

`BinaryWriter` і `BinaryReader` читають і пишуть примітивні типи в компактній двійковій формі (little-endian):

```csharp
using var w = new BinaryWriter(File.Create("points.bin"));
w.Write(points.Count);              // int32
foreach (var p in points) { w.Write(p.X); w.Write(p.Y); w.Write(p.Label); }   // double + рядок

using var r = new BinaryReader(File.OpenRead("points.bin"));
int count = r.ReadInt32();
for (int i = 0; i < count; i++) list.Add(new Point(r.ReadDouble(), r.ReadDouble(), r.ReadString()));
```

- Рядки мають **префікс довжини** (довжина в 7-бітному кодуванні, потім байти в обраному кодуванні), тож `ReadString` знає, де закінчується кожен.
- Читати треба точно в тому порядку й тих типах, що й писали; схеми немає. Покладіть на початок формату **магічний заголовок** і номер версії, щоб відхиляти чужі файли й розвивати формат.
- Для фіксованого порядку байтів незалежно від платформи беріть `BinaryPrimitives.WriteInt32BigEndian` та подібні.

## Закриття та звільнення адаптерів

Звільнення адаптера за замовчуванням **звільняє й потік під ним**. Це зручно для файлів, але неправильно, коли потік вам не належить (потік від викликача, тіло HTTP-відповіді, `MemoryStream`, який ви хочете потім прочитати). Використовуйте параметр конструктора `leaveOpen`:

```csharp
using (var writer = new StreamWriter(stream, Encoding.UTF8, bufferSize: 1024, leaveOpen: true))
    writer.Write(payload);
stream.Position = 0;    // потік досі придатний
```

Завжди звільняйте (чи принаймні робіть `Flush`) писача: адаптери буферизують дані, і все, що лишилося в буфері, губиться, якщо писача просто покинути.

## Порядок звільнення

З шаруватими потоками звільняйте спершу **зовнішній** шар (адаптер → декоратор → сховище). Вкладені `using` роблять це природно, бо звільняють у зворотному порядку створення. Якщо першим звільнити внутрішній потік, зовнішній шар не зможе скинути свої буферизовані дані.

## Що сказати на співбесіді

- `StreamReader/Writer` — для тексту з кодуванням; `BinaryReader/Writer` — для компактних примітивів.
- Адаптери звільняють обгорнутий потік, якщо не `leaveOpen: true`.
- Скидайте/звільняйте писачів, починаючи із зовнішнього, інакше буферизовані дані загубляться.
