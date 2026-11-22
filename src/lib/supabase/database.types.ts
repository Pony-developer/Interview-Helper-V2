/**
 * Database types for the `public` schema.
 * Hand-maintained to match supabase/migrations. Regenerate with:
 *   npm run db:types   (supabase gen types --lang=typescript --remote --schema public)
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Localized = Json;

/** 'seed' rows come from content/ in the repository; 'admin' rows were edited in the admin panel. */
export type ContentSource = "seed" | "admin";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13" };
  public: {
    Tables: {
      skills: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          aliases: string[];
          description: Localized;
          codeable: boolean;
          has_content: boolean;
          popularity: number;
          source: ContentSource;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lectures: {
        Row: {
          id: string;
          slug: string;
          skill_id: string;
          title: Localized;
          summary: Localized;
          body: Localized;
          reading_minutes: number;
          source: ContentSource;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "lectures_skill_id_fkey"; columns: ["skill_id"]; isOneToOne: false; referencedRelation: "skills"; referencedColumns: ["id"] },
        ];
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: Localized;
          summary: Localized;
          topics: Json;
          sort_order: number;
          published: boolean;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      course_modules: {
        Row: { id: string; course_id: string; slug: string; title: Localized; sort_order: number };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      course_slides: {
        Row: {
          id: string;
          course_id: string;
          module_id: string;
          slug: string;
          kind: "lecture" | "quiz" | "practice";
          title: Localized;
          body: Localized;
          quiz: Json | null;
          practice: Json | null;
          max_score: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      course_progress: {
        Row: {
          user_id: string;
          slide_id: string;
          score: number;
          completed: boolean;
          attempts: number;
          last_code: string | null;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          slug: string;
          kind: Database["public"]["Enums"]["task_kind"];
          complexity: number;
          est_seconds: number;
          title: Localized;
          prompt: Localized;
          lecture_id: string | null;
          quiz: Json | null;
          practice: Json | null;
          published: boolean;
          source: ContentSource;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "tasks_lecture_id_fkey"; columns: ["lecture_id"]; isOneToOne: false; referencedRelation: "lectures"; referencedColumns: ["id"] },
        ];
      };
      task_skills: {
        Row: { task_id: string; skill_id: string; weight: number };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "task_skills_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] },
          { foreignKeyName: "task_skills_skill_id_fkey"; columns: ["skill_id"]; isOneToOne: false; referencedRelation: "skills"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
        };
        Insert: never;
        /** `role` is not updatable by clients: use the `set_user_role` RPC. */
        Update: { display_name?: string | null; avatar_url?: string | null };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          locale: string;
          method: Database["public"]["Enums"]["interview_method"];
          source_url: string | null;
          level: Database["public"]["Enums"]["interview_level"];
          detected_skill_ids: string[];
          focus_skill_ids: string[];
          status: Database["public"]["Enums"]["interview_status"];
          budget_seconds: number;
          started_at: string;
          completed_at: string | null;
          score: number | null;
          grade: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          locale?: string;
          method: Database["public"]["Enums"]["interview_method"];
          source_url?: string | null;
          level: Database["public"]["Enums"]["interview_level"];
          detected_skill_ids?: string[];
          focus_skill_ids?: string[];
          budget_seconds: number;
        };
        Update: never;
        Relationships: [];
      };
      interview_items: {
        Row: {
          id: string;
          interview_id: string;
          task_id: string;
          position: number;
          status: Database["public"]["Enums"]["item_status"];
          answer: Json | null;
          tests_passed: number | null;
          tests_total: number | null;
          is_correct: boolean | null;
          score: number | null;
          help_used: boolean;
          time_spent_seconds: number;
          submitted_at: string | null;
        };
        Insert: { id?: string; interview_id: string; task_id: string; position: number };
        Update: never;
        Relationships: [
          { foreignKeyName: "interview_items_interview_id_fkey"; columns: ["interview_id"]; isOneToOne: false; referencedRelation: "interviews"; referencedColumns: ["id"] },
          { foreignKeyName: "interview_items_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] },
        ];
      };
      user_task_progress: {
        Row: {
          user_id: string;
          task_id: string;
          status: Database["public"]["Enums"]["progress_status"];
          attempts: number;
          passes: number;
          last_score: number;
          last_attempt_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "user_task_progress_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: {
      user_skill_mastery: {
        Row: {
          user_id: string;
          skill_id: string;
          tasks_attempted: number;
          tasks_passed: number;
          attempts: number;
          avg_last_score: number;
          last_attempt_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      submit_item: {
        Args: {
          p_item_id: string;
          p_answer?: Json | null;
          p_tests_passed?: number | null;
          p_tests_total?: number | null;
          p_time_spent?: number;
          p_skip?: boolean;
        };
        Returns: Json;
      };
      mark_help_used: { Args: { p_item_id: string }; Returns: undefined };
      course_mark_viewed: { Args: { p_slide: string }; Returns: undefined };
      course_submit_quiz: { Args: { p_slide: string; p_answers: Json }; Returns: Json };
      course_submit_practice: { Args: { p_slide: string; p_code: string; p_output: string }; Returns: Json };
      course_save_code: { Args: { p_slide: string; p_code: string }; Returns: undefined };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      set_user_role: {
        Args: { p_user_id: string; p_role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      finish_interview: { Args: { p_interview_id: string }; Returns: Json };
      admin_save_skill: { Args: { p_skill: Json; p_create: boolean }; Returns: string };
      admin_delete_skill: { Args: { p_slug: string }; Returns: undefined };
      admin_save_lecture: { Args: { p_lecture: Json; p_create: boolean }; Returns: string };
      admin_delete_lecture: { Args: { p_slug: string }; Returns: undefined };
      admin_save_task: { Args: { p_task: Json; p_create: boolean }; Returns: string };
      admin_get_task: { Args: { p_slug: string }; Returns: Json };
      admin_set_task_published: { Args: { p_slug: string; p_published: boolean }; Returns: undefined };
      admin_delete_task: { Args: { p_slug: string }; Returns: undefined };
      get_interview_review: {
        Args: { p_interview_id: string };
        Returns: {
          item_id: string;
          item_position: number;
          task_id: string;
          status: Database["public"]["Enums"]["item_status"];
          answer: Json | null;
          tests_passed: number | null;
          tests_total: number | null;
          is_correct: boolean | null;
          score: number | null;
          help_used: boolean;
          time_spent_seconds: number;
          correct_option_ids: string[] | null;
          explanation: Json | null;
          solution_files: Json | null;
        }[];
      };
    };
    Enums: {
      app_role: "user" | "admin";
      task_kind: "quiz" | "practice";
      interview_method: "manual" | "url" | "llm_url" | "llm_text";
      interview_level: "junior" | "middle" | "senior";
      interview_status: "in_progress" | "completed" | "abandoned";
      item_status: "pending" | "answered" | "skipped";
      progress_status: "passed" | "failed";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
