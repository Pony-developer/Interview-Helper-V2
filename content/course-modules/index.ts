import { csharpModules } from "./csharp";
import { databasesModules } from "./databases";
import type { ModuleDef } from "./types";

export type { Localized, ModuleDef, QuizQuestionDef, SlideDef } from "./types";

/** Modules per course slug. A course without an entry has no published modules yet. */
export const courseModules: Record<string, ModuleDef[]> = {
  csharp: csharpModules,
  databases: databasesModules,
};
