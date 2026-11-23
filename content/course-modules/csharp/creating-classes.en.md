`Main` already uses a class `Book` that does not exist yet, so the program does not compile. Write the class.

A `Book` has:

- a constructor `Book(title, author, pages)`;
- the method `Describe()`, which returns the text `Title by Author (N pages)`;
- the method `IsLong()`, which is `true` for a book of **300 pages or more**;
- the method `ReadingDays(pagesPerDay)`, which returns the number of days that are needed to read the book, reading `pagesPerDay` pages a day, **rounded up**: 310 pages at 40 a day is 8 days, because 7 days are not enough.

Write the class **above** `Program`. Keep the data **private**, and give the class only the members that `Main` needs. Do not change `Main`. Expected output:

```text
The Hobbit by J.R.R. Tolkien (310 pages)
True
8
Poems by Ann (80 pages)
False
2
1
```

Hint: rounding a division **up** with integers: `(pages + pagesPerDay - 1) / pagesPerDay`. Store the three constructor arguments in fields, and use them in the methods.
