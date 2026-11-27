## Завдання

Реалізуйте `Tfm.Describe(string tfm)`, який перетворює монік цільового фреймворку на зрозумілу назву:

| Вхід | Результат |
| --- | --- |
| `net6.0` | `.NET 6.0` (версія з крапкою — це сучасний .NET) |
| `netstandard2.0` | `.NET Standard 2.0` |
| `netcoreapp3.1` | `.NET Core 3.1` |
| `net48` | `.NET Framework 4.8` (цифри без крапок: поставте крапку між кожними двома цифрами) |
| `net472` | `.NET Framework 4.7.2` |
| `net6.0-windows` | `.NET 6.0 (windows)` (суфікс ОС після `-` іде в дужки) |
| будь-що інше | `unknown` |

Перевіряйте довші префікси (`netstandard`, `netcoreapp`) раніше за просте `net`.

Очікуваний результат:

```
net6.0 => .NET 6.0
netstandard2.0 => .NET Standard 2.0
netcoreapp3.1 => .NET Core 3.1
net48 => .NET Framework 4.8
net472 => .NET Framework 4.7.2
net6.0-windows => .NET 6.0 (windows)
java8 => unknown
```
