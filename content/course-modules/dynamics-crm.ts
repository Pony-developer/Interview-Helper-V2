import { clientModule } from "./dynamics-crm-modules/client";
import { extensibilityModule } from "./dynamics-crm-modules/extensibility";
import { platformModule } from "./dynamics-crm-modules/platform";
import { pluginQualityModule } from "./dynamics-crm-modules/plugin-quality";
import { pluginsModule } from "./dynamics-crm-modules/plugins";
import { sdkModule } from "./dynamics-crm-modules/sdk";
import { securityModule } from "./dynamics-crm-modules/security";
import { solutionsModule } from "./dynamics-crm-modules/solutions";
import type { ModuleDef } from "./types";

/**
 * The "Dynamics CRM Development" course: Dataverse, solutions and ALM, the SDK, plug-ins,
 * Custom APIs and integrations, client-side scripting and the security model.
 * Lecture and task texts live in content/course-modules/dynamics-crm/<slide>.<en|uk>.md.
 * The C# practices model the Dataverse SDK in plain C# 7, so they run on Wandbox without NuGet packages:
 *   npx tsx scripts/verify-course-practice.ts      checks the C# practices
 *   npx tsx scripts/verify-sql-practice.ts --write fills in expectedOutput of the SQL practice
 */
export const dynamicsCrmModules: ModuleDef[] = [
  platformModule,
  solutionsModule,
  sdkModule,
  pluginsModule,
  pluginQualityModule,
  extensibilityModule,
  clientModule,
  securityModule,
];
