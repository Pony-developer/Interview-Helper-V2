import { juniorModules } from "./dotnet-interview-modules/junior";
import {
  juniorAsyncDbExtras,
  juniorClassesExtras,
  juniorGeneralExtras,
  juniorPlatformExtras,
  juniorPracticalExtras,
  juniorTypesExtras,
} from "./dotnet-interview-modules/junior-extra";
import { middleModules } from "./dotnet-interview-modules/middle";
import {
  middleCollectionsExtras,
  middleDbExtras,
  middleGeneralExtras,
  middlePlatformExtras,
  middlePracticalExtras,
} from "./dotnet-interview-modules/middle-extra";
import { mockInterviewsModule } from "./dotnet-interview-modules/mock";
import { seniorModules } from "./dotnet-interview-modules/senior";
import {
  seniorDatabasesExtras,
  seniorEngineeringExtras,
  seniorMicroservicesExtras,
  seniorPracticalExtras,
  seniorRuntimeExtras,
} from "./dotnet-interview-modules/senior-extra";
import type { ModuleDef, SlideDef } from "./types";

/**
 * The ".NET Interview Preparation" course, built on the DOU list
 * "Співбесіда з .NET. 150+ запитань для Junior, Middle, Senior"
 * (https://dou.ua/lenta/articles/interview-questions-net-developer/).
 * Modules follow the article's levels and sections (Junior, Middle, Senior × general, platform, data, …):
 * the question lists, lectures with model answers and deeper dives, several quizzes per section and practices
 * built from the article's practical tasks. Practices that already exist elsewhere on the platform are not repeated.
 * Lecture and task texts live in content/course-modules/dotnet-interview/<slide>.<en|uk>.md.
 * Check the practices with:
 *   npx tsx scripts/verify-course-practice.ts dotnet-interview   (C#, on Wandbox)
 *   npx tsx scripts/verify-sql-practice.ts                       (SQL, locally on PGlite)
 */

/** Extra slides (follow-ups, predict-the-output, more practice) appended to the end of a module, by module slug. */
const extras: Record<string, SlideDef[]> = {
  "junior-general": juniorGeneralExtras,
  "junior-platform": juniorPlatformExtras,
  "junior-types": juniorTypesExtras,
  "junior-classes": juniorClassesExtras,
  "junior-async-db-tests": juniorAsyncDbExtras,
  "junior-practical": juniorPracticalExtras,
  "middle-general": middleGeneralExtras,
  "middle-platform": middlePlatformExtras,
  "middle-collections": middleCollectionsExtras,
  "middle-db-parallelism": middleDbExtras,
  "middle-practical": middlePracticalExtras,
  "senior-engineering": seniorEngineeringExtras,
  "senior-runtime": seniorRuntimeExtras,
  "senior-databases": seniorDatabasesExtras,
  "senior-microservices-azure": seniorMicroservicesExtras,
  "senior-practical": seniorPracticalExtras,
};

const withExtras = (m: ModuleDef): ModuleDef => ({ ...m, slides: [...m.slides, ...(extras[m.slug] ?? [])] });

export const dotnetInterviewModules: ModuleDef[] = [
  ...[...juniorModules, ...middleModules, ...seniorModules].map(withExtras),
  mockInterviewsModule,
];
