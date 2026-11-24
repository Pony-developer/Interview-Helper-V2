import { angularModule } from "./frontend-interview-modules/angular";
import { designPatternsModule } from "./frontend-interview-modules/design-patterns";
import { authSecurityModule } from "./frontend-interview-modules/auth-security";
import { microFrontendsModule } from "./frontend-interview-modules/micro-frontends";
import { stateManagementModule } from "./frontend-interview-modules/state-management";
import { ydkjsIntoJsModule } from "./frontend-interview-modules/ydkjs-into-js";
import { cssTopicsModule } from "./frontend-interview-modules/css-topics";
import { extraModule } from "./frontend-interview-modules/extra";
import { htmlTopicsModule } from "./frontend-interview-modules/html-topics";
import { jsModule } from "./frontend-interview-modules/js";
import { middleModule } from "./frontend-interview-modules/middle";
import { questionsModule } from "./frontend-interview-modules/questions";
import { reactTopicsModule } from "./frontend-interview-modules/react-router-redux";
import { seniorModule } from "./frontend-interview-modules/senior";
import { systemDesignModule } from "./frontend-interview-modules/system-design";
import { tailwindModule } from "./frontend-interview-modules/tailwind";
import { vueModule } from "./frontend-interview-modules/vue";
import type { ModuleDef } from "./types";

/**
 * The "Frontend Interview Preparation" course: typical frontend interview questions by level
 * (Junior, Middle, Senior), additional questions from another list, and quizzes on them.
 * Lecture texts live in content/course-modules/frontend-interview/<slide>.<en|uk>.md.
 */
export const frontendInterviewModules: ModuleDef[] = [questionsModule, middleModule, seniorModule, extraModule, jsModule, cssTopicsModule, htmlTopicsModule, reactTopicsModule, angularModule, tailwindModule, vueModule, systemDesignModule, designPatternsModule, authSecurityModule, microFrontendsModule, stateManagementModule, ydkjsIntoJsModule];
