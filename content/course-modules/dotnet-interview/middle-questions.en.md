The Middle-level questions from the DOU list "[.NET interview: 150+ questions for Junior, Middle, Senior](https://dou.ua/lenta/articles/interview-questions-net-developer/)". The numbering follows the article (it jumps from 90 to 100). Answer out loud first, then read the model answers in the lectures that follow.

## General

54. You type google.com in a browser. Describe in as much detail as possible what happens at the HTTP level.
55. How does HTTPS work?
56. How do you understand SOLID?
57. Which serialization protocols do you know, and where are they used?
58. What is a pure function? What are its advantages?
59. What is dependency injection and why is it needed?
60. What are cohesion and coupling?
61. What are IaaS, PaaS and SaaS, and how do they differ?
62. Which debugging approaches do you use?
63. Which design patterns do you know? Explain them.
64. What is the essence of the Singleton pattern? Why is it also called an anti-pattern?
65. What is the Strategy pattern for?
66. What are the key differences between distributed and monolithic systems?
67. Which design patterns for distributed systems do you know?
68. How does a message bus work? Why can duplicates appear in queues?
69. Which principles are used to build idempotent services?
70. How do asynchronous methods work? How does asynchrony differ from parallelism?

## The .NET platform

71. Which exceptions cannot be stopped in a `catch` block?
72. What is the difference between a .NET Standard class library and a .NET Core class library?
73. What is the difference between deferred and immediate execution in LINQ? Give examples.
74. What is the `ConfigureServices` method in `Startup.cs` for?
75. What is the difference between `services.AddTransient` and `services.AddScoped` in ASP.NET Core?
76. What is Kestrel?
77. Describe the ASP.NET MVC request pipeline.
78. How do you configure caching of responses to HTTP requests in ASP.NET Web API?

## Memory management

79. What are the heap and the stack? How do they differ and how does each work?
80. How does the garbage collector work?
81. Why does C# have the `using` keyword if .NET manages memory automatically? How does it relate to the Dispose pattern, and why is that pattern so complex for managed vs unmanaged resources?
82. What are the specifics of the Large Object Heap?

## Data types, collections, data structures

83. Is a concrete generic class generated at run time or at compile time?
84. What is reflection?
85. Describe `LinkedList<T>`. How does it differ from other collections?
86. What is an indexer?
87. What is an immutable object? What are its advantages? Suggest how to implement one in .NET.
88. When should you use `StringBuilder` instead of `string`? How does `StringBuilder` work?
89. What is tree balancing?
90. What are key-value structures?
100. What is a hash function and why do we need hash tables?
101. Which properties should an ideal hash function have?
102. What are collisions and how do you deal with them?
103. What is the complexity of CRUD operations in `Dictionary<K, V>` in .NET?
104. Where are arrays stored? What about arrays of primitive types?
105. What is the difference between an array (`T[]`) and `List<T>`?
106. What is the difference between `IList<T>` and `IEnumerable<T>`?
107. Why do we need Enumerable, Observable and AsyncEnumerable, and which data-retrieval models do they implement?
108. What is the difference between `IEnumerable` and `IQueryable`?
109. What are enum flags?

## Databases

110. Describe the normal forms in relational databases.
111. What is an index in a database?
112. When should indexes be used? Pros and cons.
113. Which types of indexes exist, and how do they differ?
114. What is ACID?
115. Which transaction isolation levels do you know?
116. What is an execution plan in MS SQL?
117. A query runs slowly. How do you diagnose and fix it?
118. How do ORMs (Entity Framework, EF Core) translate C# code into a database query language? What is used for this?

## Parallelism

119. What is `Task.ConfigureAwait` used for?
120. A web server runs a database query per HTTP request. The server has 16 threads in total, and each request blocks its thread while waiting for results. Can .NET optimize this?
121. What is the ThreadPool for? Describe its mechanics: how a thread is taken from the pool and returned to it.

## Practical tasks

- Generate the Fibonacci sequence; check a collection for duplicates. (practice)
- Design a thread-safe Singleton in C#. (practice)
- Design a database of doctors and patients; find doctors with more than N patients. (SQL practice)
- An entity must be written to the database and an event sent to a message broker. How do you do this with minimal risk of losing data? A chain of three services: how do you avoid losing or duplicating data? (lecture "Not losing data between services")
- Will this code work, and why? What is wrong with it, and how would you improve it? (lecture "What is wrong with this code?")
