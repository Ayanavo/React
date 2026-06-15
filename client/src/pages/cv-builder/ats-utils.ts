import { cn } from "@/lib/utils";
import type { AtsAnalysisRecord } from "@/shared/services/cvbuilder";
import type { AtsCheckResponse } from "@/shared/services/cvbuilder";

export function getAtsScoreBadgeClass(score: number) {
  if (score >= 75) {
    return "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }

  if (score >= 60) {
    return "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }

  return "border-transparent bg-red-500/15 text-red-700 dark:text-red-400";
}

export function toAtsAnalysisRecord(result: AtsCheckResponse): AtsAnalysisRecord {
  return {
    score: result.score,
    ranking: result.ranking,
    summary: result.summary,
    strengths: result.strengths,
    gaps: result.gaps,
    recommendations: result.recommendations,
    model: result.model,
  };
}

export function atsRecordToResponse(record: AtsAnalysisRecord): AtsCheckResponse {
  return {
    ...record,
    model: record.model ?? "gemini-2.5-flash",
  };
}

export function formatAtsBadgeLabel(score: number) {
  return `${Math.round(score)}%`;
}

export function atsBadgeClassName(score: number, className?: string) {
  return cn("ml-1 tabular-nums", getAtsScoreBadgeClass(score), className);
}
