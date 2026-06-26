export type JobSummaryContext = {
  summary: string;
  sourceText?: string;
  fileName?: string;
  model?: string;
  createdAt: string;
};

const STORAGE_KEY = "job-summary-context";

export function setJobSummaryContext(ctx: JobSummaryContext): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
}

export function peekJobSummaryContext(): JobSummaryContext | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as JobSummaryContext;
  } catch {
    return null;
  }
}

export function consumeJobSummaryContext(): JobSummaryContext | null {
  const ctx = peekJobSummaryContext();
  if (ctx) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return ctx;
}
