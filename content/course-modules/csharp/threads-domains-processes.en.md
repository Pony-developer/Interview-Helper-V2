Before writing parallel code, it helps to know what runs where. Three words describe the layers:

- A **process** is a running program with its own private memory. Two processes cannot read each other's variables. Starting a process is expensive.
- An **application domain** (AppDomain) is an isolated area inside one process. .NET uses domains to load and unload code safely; in modern .NET the idea is mostly hidden from the programmer.
- A **thread** is a unit of execution inside a process. All the threads of one process share its memory, so they can read and write the same variables. Creating a thread is much cheaper than creating a process.

```text
process: ConsoleApp.exe              (private memory, its own resources)
  thread 1: Main                     (runs the program)
  thread 2: Think(3)                 (created by the program)
  thread 3: Think(5)                 (created by the program)
  all three threads see the same static fields
```

## What a thread does

The processor executes one thread at a time on each core. When there are more threads than cores, the operating system switches between them many times per second, so they appear to run together. The order of the switches is not under your control. This is why two threads that change the same variable can produce wrong results, as the lecture about shared resources explains.

## Why threads at all

- **Responsiveness:** a window keeps reacting while a long operation runs on another thread.
- **Speed:** a heavy calculation can use several cores at once.
- **Waiting:** a thread can wait for a file or a network without stopping the rest of the program.

The next lectures show how to create and run threads in C#.
