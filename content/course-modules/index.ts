import { advancedCsharpModules } from "./advanced-csharp";
import { csharpModules } from "./csharp";
import { databasesModules } from "./databases";
import { designPatternsModules } from "./design-patterns";
import { dotnetInterviewModules } from "./dotnet-interview";
import { dynamicsCrmModules } from "./dynamics-crm";
import { frontendInterviewModules } from "./frontend-interview";
import type { ModuleDef } from "./types";

export type { Localized, ModuleDef, QuizQuestionDef, SlideDef } from "./types";

/** Modules per course slug. A course without an entry has no published modules yet. */
export const courseModules: Record<string, ModuleDef[]> = {
  "advanced-csharp": advancedCsharpModules,
  csharp: csharpModules,
  databases: databasesModules,
  "design-patterns": designPatternsModules,
  "dotnet-interview": dotnetInterviewModules,
  "dynamics-crm": dynamicsCrmModules,
  "frontend-interview": frontendInterviewModules,
};
