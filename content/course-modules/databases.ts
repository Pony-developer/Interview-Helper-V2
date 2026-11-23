import { advancedModule } from "./databases-modules/advanced";
import { aggregationModule } from "./databases-modules/aggregation";
import { comparisonModule } from "./databases-modules/comparison";
import { ddlModule } from "./databases-modules/ddl";
import { designModule } from "./databases-modules/design";
import { dmlModule } from "./databases-modules/dml";
import { finalModule } from "./databases-modules/final";
import { fundamentalsModule } from "./databases-modules/fundamentals";
import { indexesModule } from "./databases-modules/indexes";
import { joinsModule } from "./databases-modules/joins";
import { mongodbModule } from "./databases-modules/mongodb";
import { selectModule } from "./databases-modules/select";
import { subqueriesModule } from "./databases-modules/subqueries";
import { transactionsModule } from "./databases-modules/transactions";
import { windowsModule } from "./databases-modules/windows";
import type { ModuleDef } from "./types";

/**
 * The "Databases" course: SQL on PostgreSQL from the first SELECT to transactions and indexes,
 * then NoSQL with MongoDB and a comparison of the two worlds.
 * Lecture and task texts live in content/course-modules/databases/<slide>.<en|uk>.md;
 * the practice databases are in databases-data.ts. SQL practices run on PGlite:
 *   npx tsx scripts/verify-sql-practice.ts --write   fills in expectedOutput from the solutions.
 */
export const databasesModules: ModuleDef[] = [
  fundamentalsModule,
  selectModule,
  ddlModule,
  dmlModule,
  joinsModule,
  aggregationModule,
  subqueriesModule,
  windowsModule,
  designModule,
  indexesModule,
  transactionsModule,
  advancedModule,
  mongodbModule,
  comparisonModule,
  finalModule,
];
