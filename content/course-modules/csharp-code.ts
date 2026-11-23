/** Builders for the C# programs of the course practices (shared by csharp.ts and csharp-modules/). */

/** A program whose whole body sits inside `class Program`. */
export const PROGRAM = (body: string, extraUsings = "") =>
  `using System;\n${extraUsings ? `${extraUsings}\n` : ""}\nclass Program\n{\n${body}\n}\n`;

/**
 * A program whose classes sit at the top level (as in a real project), followed by `Program`.
 * `members` go inside Program before Main (static helper methods); `main` is the body of Main.
 */
export const PROGRAM_WITH = (types: string, main: string, extraUsings = "", members = "") =>
  `using System;\n${extraUsings ? `${extraUsings}\n` : ""}\n${types}\n\nclass Program\n{\n${members ? `${members}\n\n` : ""}    static void Main()\n    {\n${main}\n    }\n}\n`;
