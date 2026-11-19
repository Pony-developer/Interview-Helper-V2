/**
 * Database types for the `public` schema.
 * Hand-maintained to match supabase/migrations. Regenerate with:
 *   npx supabase gen types typescript --linked --schema public > src/lib/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Localized = Json;

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
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "lectures_skill_id_fkey"; columns: ["skill_id"]; isOneToOne: false; referencedRelation: "skills"; referencedColumns: ["id"] },
        ];
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
        Row: { id: string; display_name: string | null; avatar_url: string | null; created_at: string };
        Insert: never;
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
      finish_interview: { Args: { p_interview_id: string }; Returns: Json };
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
