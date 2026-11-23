import { fundamentalsModule } from "./databases-modules/fundamentals";
import type { ModuleDef } from "./types";

/**
 * The "Databases" course: SQL on PostgreSQL from the first SELECT to transactions and indexes,
 * then NoSQL with MongoDB and a comparison of the two worlds.
 * Lecture and task texts live in content/course-modules/databases/<slide>.<en|uk>.md;
 * the practice databases are in databases-data.ts.
 */
export const databasesModules: ModuleDef[] = [fundamentalsModule];
