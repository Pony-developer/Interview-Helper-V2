export type TestCaseResult = { name: string; status: "pass" | "fail"; ms?: number; error?: string };

export type TestRun = {
  total: number;
  passed: number;
  ms: number;
  tests: TestCaseResult[];
  timedOut?: boolean;
};

export type TestRunState =
  | { status: "waiting" }
  | { status: "running"; total: number }
  | { status: "done"; run: TestRun }
  | { status: "error"; message: string };
