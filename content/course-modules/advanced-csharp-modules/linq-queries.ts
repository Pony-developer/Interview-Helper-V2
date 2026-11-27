import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const miniLinqTypes = (body: string) => `static class MiniLinq
{
    // Like Enumerable.Where: lazy, and logs "where <item>" each time it examines an item.
    public static IEnumerable<T> MyWhere<T>(this IEnumerable<T> source, Func<T, bool> predicate)
    {
${body.split("@@")[0]}
    }

    // Like Enumerable.Select: lazy, and logs "select <item>" each time it projects an item.
    public static IEnumerable<TResult> MySelect<T, TResult>(this IEnumerable<T> source, Func<T, TResult> selector)
    {
${body.split("@@")[1]}
    }

    // Like Enumerable.Take: stops pulling from the source after 'count' items.
    public static IEnumerable<T> MyTake<T>(this IEnumerable<T> source, int count)
    {
${body.split("@@")[2]}
    }
}`;

const miniLinqSolution = [
  `        foreach (var item in source)
        {
            Console.WriteLine("where " + item);
            if (predicate(item)) yield return item;
        }`,
  `        foreach (var item in source)
        {
            Console.WriteLine("select " + item);
            yield return selector(item);
        }`,
  `        if (count <= 0) yield break;
        foreach (var item in source)
        {
            yield return item;
            if (--count == 0) yield break;
        }`,
].join("@@");

const miniLinqMain = `        var numbers = new List<int> { 1, 2, 3, 4, 5, 6 };
        var query = numbers.MyWhere(n => n % 2 == 0).MySelect(n => n * 10).MyTake(2);
        Console.WriteLine("query built");
        numbers.Insert(0, 8);                 // deferred: the query will see this
        foreach (var x in query) Console.WriteLine("got " + x);
        Console.WriteLine("count again: " + query.Count());`;

export const linqQueriesModule: ModuleDef = {
  slug: "linq-queries",
  title: { en: "LINQ queries", uk: "LINQ-запити" },
  slides: [
    lecture("linq-fundamentals", "Sequences, operators, fluent and query syntax", "Послідовності, оператори, fluent- і query-синтаксис"),
    lecture("deferred-execution", "Deferred execution", "Відкладене виконання"),
    lecture("subqueries-composition", "Subqueries, let, into and composition", "Підзапити, let, into і композиція"),
    lecture("interpreted-queries", "Interpreted queries, IQueryable and EF Core", "Інтерпретовані запити, IQueryable та EF Core"),
    lecture("expression-trees", "Building expression trees", "Побудова дерев виразів"),
    quiz("linq-queries-quiz", "LINQ queries", "LINQ-запити", [
      question(
        "deferred",
        ["`var q = list.Where(x => x > 2); list.Add(10);` Is 10 included when `q` is enumerated?", "`var q = list.Where(x => x > 2); list.Add(10);` Чи потрапить 10 у результат, коли `q` перелічать?"],
        [
          ["No, the query was evaluated when it was created", "Ні, запит обчислено під час створення"],
          ["Yes: `Where` is deferred, so it runs when enumerated and sees the current list", "Так: `Where` відкладений, тож виконується під час перелічення й бачить поточний список"],
          ["It throws because the list was modified", "Кидає виняток, бо список змінено"],
          ["Only if `list` is an array", "Лише якщо `list` — масив"],
        ],
        "b",
      ),
      question(
        "immediate",
        ["Which operators execute immediately?", "Які оператори виконуються негайно?"],
        [
          ["`ToList`, `ToArray`, `ToDictionary`", "`ToList`, `ToArray`, `ToDictionary`"],
          ["`Count`, `Sum`, `First`, `Any`", "`Count`, `Sum`, `First`, `Any`"],
          ["`Select`, `Where`, `OrderBy`", "`Select`, `Where`, `OrderBy`"],
          ["`Max`, `Aggregate`", "`Max`, `Aggregate`"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "query-syntax",
        ["What does the compiler do with `from o in orders where o.Total > 100 select o.Id`?", "Що компілятор робить з `from o in orders where o.Total > 100 select o.Id`?"],
        [
          ["Sends it to SQL Server", "Надсилає в SQL Server"],
          ["Interprets it at run time", "Інтерпретує під час виконання"],
          ["It's only valid inside EF Core", "Це валідно лише всередині EF Core"],
          ["Translates it to method calls: `orders.Where(o => o.Total > 100).Select(o => o.Id)`", "Перекладає у виклики методів: `orders.Where(o => o.Total > 100).Select(o => o.Id)`"],
        ],
        "d",
      ),
      question(
        "let",
        ["What is `let` for in a query expression?", "Для чого `let` у query-виразі?"],
        [
          ["To introduce a new variable computed once per element, usable in later clauses", "Щоб ввести нову змінну, обчислену раз для кожного елемента й доступну в наступних клаузах"],
          ["To declare a constant", "Щоб оголосити константу"],
          ["To join two sequences", "Щоб з'єднати дві послідовності"],
          ["To make the query execute immediately", "Щоб запит виконався негайно"],
        ],
        "a",
      ),
      question(
        "iqueryable",
        ["How does `IQueryable<T>` differ from `IEnumerable<T>` in LINQ?", "Чим `IQueryable<T>` відрізняється від `IEnumerable<T>` у LINQ?"],
        [
          ["It is faster in memory", "Він швидший у пам'яті"],
          ["Lambdas become expression trees that a provider (e.g. EF Core) translates into another language such as SQL", "Лямбди стають деревами виразів, які провайдер (наприклад, EF Core) перекладає іншою мовою, як-от SQL"],
          ["It can only be enumerated once", "Його можна перелічити лише раз"],
          ["It supports only Where and Select", "Він підтримує лише Where і Select"],
        ],
        "b",
      ),
      question(
        "asenumerable",
        ["Why might you call `AsEnumerable()` in the middle of an EF Core query?", "Навіщо викликати `AsEnumerable()` посеред запиту EF Core?"],
        [
          ["To make the query faster on the server", "Щоб запит виконувався швидше на сервері"],
          ["To cache the results", "Щоб закешувати результати"],
          ["To switch the rest of the query to LINQ to Objects so it can call .NET methods the database can't translate", "Щоб решта запиту йшла через LINQ to Objects і могла викликати методи .NET, які база даних не перекладе"],
          ["To start a transaction", "Щоб почати транзакцію"],
        ],
        "c",
      ),
      question(
        "multiple-enum",
        ["Why is enumerating the same LINQ query twice a potential problem?", "Чому двічі перелічити той самий LINQ-запит — потенційна проблема?"],
        [
          ["It throws the second time", "Другого разу кидає виняток"],
          ["The query re-executes each time: double the work, and possibly different results or a second database round trip", "Запит щоразу виконується заново: подвійна робота й, можливо, інші результати чи другий запит до бази"],
          ["The second time returns nothing", "Другого разу нічого не повертає"],
          ["It leaks memory", "Це спричиняє витік пам'яті"],
        ],
        "b",
      ),
      question(
        "expression",
        ["What is the difference between `Func<int, bool>` and `Expression<Func<int, bool>>` for the same lambda?", "Яка різниця між `Func<int, bool>` і `Expression<Func<int, bool>>` для тієї самої лямбди?"],
        [
          ["None", "Жодної"],
          ["The expression version runs faster", "Версія з виразом виконується швидше"],
          ["The Func can't be called", "Func не можна викликати"],
          ["The Func is compiled code; the Expression is a data structure describing the code, which can be inspected, translated or compiled later", "Func — скомпільований код; Expression — структура даних, що описує код, яку можна дослідити, перекласти чи скомпілювати пізніше"],
        ],
        "d",
      ),
    ]),
    practice("mini-linq-practice", "Write your own lazy operators", "Напишіть власні ліниві оператори", {
      starter: PROGRAM_WITH(miniLinqTypes(`${TODO}@@${TODO}@@${TODO}`), miniLinqMain, "using System.Collections.Generic;\nusing System.Linq;"),
      solution: PROGRAM_WITH(miniLinqTypes(miniLinqSolution), miniLinqMain, "using System.Collections.Generic;\nusing System.Linq;"),
      expectedOutput:
        "query built\nwhere 8\nselect 8\ngot 80\nwhere 1\nwhere 2\nselect 2\ngot 20\nwhere 8\nselect 8\nwhere 1\nwhere 2\nselect 2\ncount again: 2\n",
    }),
  ],
};
