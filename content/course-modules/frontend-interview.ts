import { middleModule } from "./frontend-interview-modules/middle";
import { questionsModule } from "./frontend-interview-modules/questions";
import { seniorModule } from "./frontend-interview-modules/senior";
import type { ModuleDef } from "./types";

/**
 * The "Frontend Interview Preparation" course: typical frontend interview questions by level
 * (Junior, Middle, Senior) and quizzes on them.
 * Lecture texts live in content/course-modules/frontend-interview/<slide>.<en|uk>.md.
 */
export const frontendInterviewModules: ModuleDef[] = [questionsModule, middleModule, seniorModule];
