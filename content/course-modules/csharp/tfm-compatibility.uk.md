NuGet вирішує, чи підходить пакет вашому проєкту, порівнюючи цільові фреймворки. Напишіть таку перевірку: `Check(project, library)` отримує TFM проєкту і TFM бібліотеки, яку він хоче підключити, і повертає `"yes"`, `"no"` або `"warning"`.

`Tfm.Parse` уже написано. Він дає кожному TFM `Family` (сімейство) і `Version`:

| TFM | `Family` | `Version` |
| --- | --- | --- |
| `net8.0`, `net10.0`, `netcoreapp3.1` | `"core"` | 8.0, 10.0, 3.1 |
| `net48`, `net472` | `"framework"` | 4.8, 4.7.2 |
| `netstandard2.0`, `netstandard2.1` | `"standard"` | 2.0, 2.1 |

`System.Version` підтримує `<`, `<=`, `>`, `>=`, а `new Version(4, 6, 1)` створює 4.6.1. Правила залежно від сімейства бібліотеки:

- **бібліотека core**: `"yes"`, якщо проєкт `core` і версія бібліотеки не вища за версію проєкту; інакше `"no"`;
- **бібліотека framework**: `"warning"`, якщо проєкт `core` (запасний варіант NuGet з попередженням NU1701); `"yes"`, якщо проєкт `framework` такої самої чи вищої версії; інакше `"no"`;
- **бібліотека standard**:
  - проєкт `standard`: `"yes"`, якщо версія бібліотеки не вища;
  - проєкт `core`: потрібна версія 2.0 або новіша для .NET Standard 2.0 і 3.0 або новіша для .NET Standard 2.1;
  - проєкт `framework`: лише .NET Standard 2.0 і лише починаючи з версії 4.6.1.

Не змінюйте `Main` і `Tfm`. Очікуваний вивід:

```text
net8.0 -> net6.0: yes
net6.0 -> net8.0: no
net10.0 -> netcoreapp3.1: yes
net8.0 -> netstandard2.0: yes
net8.0 -> netstandard2.1: yes
netcoreapp2.1 -> netstandard2.1: no
netcoreapp3.1 -> netstandard2.1: yes
net48 -> netstandard2.0: yes
net461 -> netstandard2.0: yes
net452 -> netstandard2.0: no
net472 -> netstandard2.1: no
net48 -> net472: yes
net472 -> net48: no
net48 -> net8.0: no
net8.0 -> net48: warning
netstandard2.1 -> netstandard2.0: yes
netstandard2.0 -> netstandard2.1: no
netstandard2.0 -> net8.0: no
netstandard2.0 -> net48: no
```

Підказка: спершу обробіть два прості сімейства бібліотек і поверніть результат одразу; потім — три випадки бібліотеки .NET Standard.
