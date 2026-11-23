import { questionsModule } from "./frontend-interview-modules/questions";
import type { ModuleDef } from "./types";

/**
 * The "Frontend Interview Preparation" course: typical frontend interview questions and quizzes on them.
 * Lecture texts live in content/course-modules/frontend-interview/<slide>.<en|uk>.md.
 */
export const frontendInterviewModules: ModuleDef[] = [questionsModule];
