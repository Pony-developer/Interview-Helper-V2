import { juniorModules } from "./dotnet-interview-modules/junior";
import { middleModules } from "./dotnet-interview-modules/middle";
import { seniorModules } from "./dotnet-interview-modules/senior";
import type { ModuleDef } from "./types";

/**
 * The ".NET Interview Preparation" course, built on the DOU list
 * "Співбесіда з .NET. 150+ запитань для Junior, Middle, Senior"
 * (https://dou.ua/lenta/articles/interview-questions-net-developer/).
 * Modules follow the article's levels and sections (Junior, Middle, Senior × general, platform, data, …):
 * the question lists, lectures with model answers and deeper dives, two quizzes per section and practices
 * built from the article's practical tasks. Practices that already exist elsewhere on the platform are not repeated.
 * Lecture and task texts live in content/course-modules/dotnet-interview/<slide>.<en|uk>.md.
 * Check the practices with:
 *   npx tsx scripts/verify-course-practice.ts dotnet-interview   (C#, on Wandbox)
 *   npx tsx scripts/verify-sql-practice.ts --only=doctors-patients (SQL, locally on PGlite)
 */
export const dotnetInterviewModules: ModuleDef[] = [...juniorModules, ...middleModules, ...seniorModules];
