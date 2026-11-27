The Senior-level questions from the DOU list "[.NET interview: 150+ questions for Junior, Middle, Senior](https://dou.ua/lenta/articles/interview-questions-net-developer/)". At this level there is rarely one right answer: interviewers listen for trade-offs, real experience and how you reason. Answer out loud first, then compare with the lectures.

## General

122. Besides OOP, which practices have you used (AOP, functional programming, etc.)?
123. Name the three most complex problems you have solved. How did you solve them, and how did you arrive at that decision?
124. What is loosely coupled code? Why is it better than tightly coupled code? How would you achieve weaker coupling?
125. Does using static classes increase or decrease coupling?
126. How can you measure code performance? Does measuring affect performance?
127. What are multi-stage builds in Docker, and how do they work?
128. How do you tell whether a piece of code uses a lot of memory or runs for a long time? What can be the bottleneck in different cases? How can you reduce memory use and memory traffic?
129. How would you implement cross-cutting concerns such as logging, validation or transactions?
130. Describe the REST maturity model.
131. What are CPU-bound and IO-bound tasks?
132. What is marshalling?
133. How does async/await work in detail? Why shouldn't you use `async void` methods?

## The .NET platform

134. How does `lock` work? Can structs be used in a `lock` expression?
135. What is an expression tree?
136. How does the garbage collector work in detail? Why does the CLR have three generations rather than, say, five, ten or two?
137. How would you organize tracing of Web API services?
138. How do you configure secret storage in .NET Core for developer machines and for production?
139. How would you organize CI/CD for .NET Core services deployed to cloud infrastructure?
140. How do you enable CORS in ASP.NET Core?

## Data types, collections, data structures

141. How are generics implemented?
142. How do you create your own immutable type?
143. How does `IEnumerable<T>` work in detail?
144. Which algorithm does the `Stack` collection use?
145. Which data structures have you implemented yourself for .NET? How did they differ from the standard implementations?
146. What is the difference between an interface and an abstract class? In which cases would you use both?
147. Why don't structs have a default (parameterless) constructor?

## Databases

148. How does a database store data?
149. Which types of databases do you know?
150. Which databases should be used, and when?
151. What is denormalization?
152. When and which transaction isolation levels can be used?
153. How do popular RDBMSs (SQL Server, PostgreSQL, …) implement ACID?
154. Have you optimized a database query? If so, how?
155. What problems can concurrent database queries cause?
156. Which database would you use to implement a distributed lock? Describe the implementation details.

## Microservices

157. Which problem do microservices solve?
158. How can microservices communicate?
159. Which variants of distributed transactions are there in microservices?
160. What is a circuit breaker?
161. How would you debug a system of many microservices when you need to trace the full path of a request?
162. What are message brokers? What are at-least-once and at-most-once semantics? Are there brokers that guarantee exactly-once?
163. How should broker client code behave depending on the chosen delivery semantics?
164. Which queue tools do you know (in .NET and standalone)? Which would you choose and why?

## MS Azure

165. Which kinds of services exist in Service Fabric?
166. What are the features and limitations of Azure Table Storage?
167. How do you deal with the cold start problem in Azure Functions?
168. What is the difference between queues and topics in Azure Service Bus?

## Practical tasks

- How would you design an FTP server? A web server? Image hosting with access rights? A system with front-office and back-office parts? A clone of a popular social network? (lecture "System design")
- A Bid holds a list of partners; bids and partners live in different services. The first screen shows the number of partners per bid. How do you store and show this counter? (lecture "System design")
- Check whether a 9×9 Sudoku grid is filled in correctly. (practice)
- Implement your own `Select`, `Where` and `SelectMany` with LINQ characteristics: deferred execution and eager argument validation. (practice)
- With LINQ, return the elements divisible by N, sorted from largest to smallest; build a new collection from a source one (distinct, sorted). (practice)
- Write a JavaScript function that returns the sum of all even elements of an array: `const sumEven = a => a.filter(x => x % 2 === 0).reduce((s, x) => s + x, 0);` — be ready for small frontend tasks even in a .NET interview.
