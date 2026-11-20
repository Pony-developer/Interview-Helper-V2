import { afterEach, describe, expect, it, vi } from "vitest";
import { isSupabaseConfigured } from "./env";

describe("isSupabaseConfigured", () => {
  afterEach(() => vi.unstubAllEnvs());

  const stub = (url: string, key = "publishable-test-key") => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
  };

  it("accepts an http(s) URL with a key", () => {
    stub("https://project.supabase.co");
    expect(isSupabaseConfigured()).toBe(true);
    stub("http://127.0.0.1:54321");
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("treats a missing or malformed URL as unconfigured instead of letting the client throw", () => {
    stub("");
    expect(isSupabaseConfigured()).toBe(false);
    stub("project.supabase.co");
    expect(isSupabaseConfigured()).toBe(false);
    stub("ftp://project.supabase.co");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("requires the publishable key", () => {
    stub("https://project.supabase.co", "");
    expect(isSupabaseConfigured()).toBe(false);
  });
});
