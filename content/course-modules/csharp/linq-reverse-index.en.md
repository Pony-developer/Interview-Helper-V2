A **reverse index** answers the question "in which documents does this word occur?" It maps each word to the list of document numbers where it appears. Search engines work this way.

Write the method `BuildIndex(string[] docs)`, which returns an `ILookup<string, int>`:

- the document numbers start at `1`;
- each word of a document is recorded once for that document, even if the word occurs several times in it;
- a word that is in no document gives an empty sequence when looked up.

Words are separated by single spaces. Do not change `Main`. Expected output:

```text
1 3
1 2
3
0
```

The lines in order: the documents with `cat` (documents `1` and `3`); the documents with `dog` (`1` and `2`); the documents with `fish` (`3` only); and the number of documents with `zebra`, which is `0`.

Hint: `docs.SelectMany((text, i) => text.Split(' ').Distinct().Select(w => new KeyValuePair<string, int>(w, i + 1)))` makes a sequence of (word, document) pairs. Then `ToLookup(p => p.Key, p => p.Value)` turns it into the index.
