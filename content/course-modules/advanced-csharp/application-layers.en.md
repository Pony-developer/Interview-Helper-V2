## What sits on top of the BCL

The CLR and BCL give you a general-purpose platform. Application layers add the APIs for a particular *kind* of program.

### Web and services: ASP.NET Core

- **Minimal APIs and MVC controllers** for HTTP APIs.
- **Razor Pages and MVC views** for server-rendered HTML.
- **Blazor**: UI components in C#. *Blazor Server* runs them on the server and syncs the DOM over a SignalR connection; *Blazor WebAssembly* runs the .NET runtime itself in the browser.
- **gRPC** and **SignalR** for RPC and real-time push.

ASP.NET Core is cross-platform, runs behind its own fast web server (Kestrel) and is built around dependency injection and a middleware pipeline.

### Desktop

| Layer | Platform | Notes |
| --- | --- | --- |
| **Windows Forms** | Windows | The oldest, simplest designer-driven UI. Still common for internal tools. |
| **WPF** | Windows | XAML, data binding, styles and templates; vector-based rendering. |
| **WinUI 3** | Windows 10+ | The modern native Windows UI stack. |
| **.NET MAUI** | Windows, macOS, Android, iOS | One XAML/C# codebase for desktop and mobile; successor to Xamarin.Forms. |

WPF and Windows Forms run on modern .NET but stay Windows-only, which is why their projects target `net6.0-windows`.

### Data and cloud

- **Entity Framework Core**: the ORM that turns LINQ queries into SQL.
- **Worker services**: long-running background processes with the same hosting and DI model as ASP.NET Core.
- **Azure Functions** and other serverless hosts run .NET code per event.

### Games and others

- **Unity** runs C# scripts on its own Mono/IL2CPP-based runtime.
- **ML.NET** for machine learning, **Orleans** for distributed actor systems.

## How to choose (a typical interview question)

- HTTP API or web site → ASP.NET Core.
- Windows-only line-of-business desktop app → WPF (or WinForms for something small).
- One app for phones and desktop → .NET MAUI.
- Background processing → worker service or Azure Functions.

## Interview takeaways

- The *language* and BCL are shared; the application layer decides the hosting model, UI technology and platform reach.
- Cross-platform: ASP.NET Core, MAUI, Blazor. Windows-only: WPF, WinForms, WinUI.
