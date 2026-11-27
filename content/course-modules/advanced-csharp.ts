import { delegatesEventsModule } from "./advanced-csharp-modules/delegates-events";
import { exceptionsIteratorsModule } from "./advanced-csharp-modules/exceptions-iterators";
import { recordsPatternsModule } from "./advanced-csharp-modules/records-patterns";
import { creatingTypesModule } from "./advanced-csharp-modules/creating-types";
import { interfacesGenericsModule } from "./advanced-csharp-modules/interfaces-generics";
import { languageExtrasModule } from "./advanced-csharp-modules/language-extras";
import { languageBasicsModule } from "./advanced-csharp-modules/language-basics";
import { nullabilityTuplesModule } from "./advanced-csharp-modules/nullability-tuples";
import { platformModule } from "./advanced-csharp-modules/platform";
import { textDatesModule } from "./advanced-csharp-modules/text-dates";
import { equalityOrderModule } from "./advanced-csharp-modules/equality-order";
import { collectionsModule } from "./advanced-csharp-modules/collections";
import { linqQueriesModule } from "./advanced-csharp-modules/linq-queries";
import { linqOperatorsModule } from "./advanced-csharp-modules/linq-operators";
import { xmlJsonModule } from "./advanced-csharp-modules/xml-json";
import { disposalGcModule } from "./advanced-csharp-modules/disposal-gc";
import { diagnosticsModule } from "./advanced-csharp-modules/diagnostics";
import { threadingTasksModule } from "./advanced-csharp-modules/threading-tasks";
import { asyncAwaitModule } from "./advanced-csharp-modules/async-await";
import { streamsIoModule } from "./advanced-csharp-modules/streams-io";
import { networkingModule } from "./advanced-csharp-modules/networking";
import { assembliesModule } from "./advanced-csharp-modules/assemblies";
import { reflectionModule } from "./advanced-csharp-modules/reflection";
import { cryptographyModule } from "./advanced-csharp-modules/cryptography";
import { advancedThreadingModule } from "./advanced-csharp-modules/advanced-threading";
import { parallelModule } from "./advanced-csharp-modules/parallel";
import { spanMemoryModule } from "./advanced-csharp-modules/span-memory";
import { interopModule } from "./advanced-csharp-modules/interop";
import { regexModule } from "./advanced-csharp-modules/regex";
import type { ModuleDef } from "./types";

/**
 * The "Advanced C#" course: C# 10 and .NET 6 in depth, one or two modules per topic area,
 * each with lectures, a quiz and a coding practice.
 * Lecture and task texts live in content/course-modules/advanced-csharp/<slide>.<en|uk>.md.
 * The C# practices run on Wandbox's Mono (C# 7.3) and are checked with:
 *   npx tsx scripts/verify-course-practice.ts advanced-csharp
 */
export const advancedCsharpModules: ModuleDef[] = [
  platformModule,
  languageBasicsModule,
  creatingTypesModule,
  interfacesGenericsModule,
  delegatesEventsModule,
  exceptionsIteratorsModule,
  nullabilityTuplesModule,
  recordsPatternsModule,
  languageExtrasModule,
  textDatesModule,
  equalityOrderModule,
  collectionsModule,
  linqQueriesModule,
  linqOperatorsModule,
  xmlJsonModule,
  disposalGcModule,
  diagnosticsModule,
  threadingTasksModule,
  asyncAwaitModule,
  streamsIoModule,
  networkingModule,
  assembliesModule,
  reflectionModule,
  cryptographyModule,
  advancedThreadingModule,
  parallelModule,
  spanMemoryModule,
  interopModule,
  regexModule,
];
