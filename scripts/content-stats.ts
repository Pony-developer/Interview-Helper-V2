/**
 * Content coverage report: quizzes and practice tasks per core skill, split by complexity.
 *   npx tsx scripts/content-stats.ts
 * Counts only a task's primary skill (its first skill reference).
 */
import { loadCourseModules } from "@/lib/content/course-loader";
import { deriveCourseTasks } from "@/lib/content/course-tasks";
import { loadContent } from "@/lib/content/loader";
import { CORE_SKILL_SLUGS } from "@content/skills";

async function main() {
  const { tasks: authored, lectures, skills } = await loadContent();
  // Includes the tasks copied from courses (content/course-tasks.ts).
  const fromCourses = deriveCourseTasks(loadCourseModules().courses, new Set(skills.map((s) => s.slug))).tasks;
  const tasks = [...authored, ...fromCourses];
  const rows = CORE_SKILL_SLUGS.map((slug) => {
    const own = tasks.filter((t) => {
      const first = t.skills[0];
      return (typeof first === "string" ? first : first.slug) === slug;
    });
    const byLevel = [1, 2, 3, 4, 5].map((c) => own.filter((t) => t.kind === "quiz" && t.complexity === c).length);
    const lecture = lectures.find((l) => l.skill === slug);
    return {
      skill: slug,
      quizzes: own.filter((t) => t.kind === "quiz").length,
      "c1-c5": byLevel.join(" "),
      practice: own.filter((t) => t.kind === "practice").length,
      "lecture en/uk words": lecture ? `${lecture.body.en.split(/\s+/).length}/${lecture.body.uk.split(/\s+/).length}` : "—",
    };
  });
  console.table(rows);
  const quizzes = tasks.filter((t) => t.kind === "quiz").length;
  console.log(`Total: ${quizzes} quizzes, ${tasks.length - quizzes} practice tasks, ${lectures.length} lectures.`);
}

main();
