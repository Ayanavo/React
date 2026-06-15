import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import showToast from "@/hooks/toast";
import type { CVElement, PageProperties } from "@/lib/useCV";
import { checkAtsScore, type AtsCheckResponse, parseAtsError } from "@/shared/services/cvbuilder";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import AtsScoreChart from "./ats-score-chart";
import { extractCVContent } from "./cv-extractor";

type AtsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elements: CVElement[];
  pageProperties: PageProperties;
  defaultJobDescription?: string;
  initialResult?: AtsCheckResponse | null;
  onBeforeAnalyze?: () => void;
  onResultChange?: (result: AtsCheckResponse | null) => void;
};

const AtsDialog = ({
  open,
  onOpenChange,
  elements,
  pageProperties,
  defaultJobDescription = "",
  initialResult = null,
  onBeforeAnalyze,
  onResultChange,
}: AtsDialogProps) => {
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [result, setResult] = useState<AtsCheckResponse | null>(initialResult);

  useEffect(() => {
    if (open) {
      setJobDescription(defaultJobDescription);
      setResult(initialResult);
    }
  }, [open, defaultJobDescription, initialResult]);

  const mutation = useMutation({
    mutationFn: async () => {
      onBeforeAnalyze?.();
      const extracted = extractCVContent(elements, pageProperties);

      if (!extracted.text.trim()) {
        throw new Error("Add some content to your CV before running an ATS check.");
      }

      return checkAtsScore({
        cvText: extracted.text,
        jobDescription: jobDescription.trim(),
        colors: extracted.colors,
        pageProperties: extracted.pageProperties,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      onResultChange?.(data);
    },
    onError: (error: Error) => {
      const info = parseAtsError(error);
      showToast({
        title: info.title,
        description: info.message,
        variant: "error",
      });
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      showToast({ title: "Job description required", variant: "error" });
      return;
    }

    mutation.mutate();
  };

  const handleOpenChange = (next: boolean) => {
    if (!mutation.isPending) {
      onOpenChange(next);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ATS Compatibility Check</DialogTitle>
          <DialogDescription>
            Paste a job description to score how well your current CV matches it.
          </DialogDescription>
        </DialogHeader>

        {!result ?
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ats-job-description">Job description</Label>
              <Textarea
                id="ats-job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-40"
                disabled={mutation.isPending}
              />
            </div>
          </div>
        : <div className="space-y-5">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-muted/30 p-4">
              <AtsScoreChart score={result.score} />
              <p className="text-sm font-semibold text-foreground">{result.ranking}</p>
            </div>

            {result.summary ?
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>
            : null}

            {result.strengths.length > 0 ?
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Strengths</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            : null}

            {result.gaps.length > 0 ?
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Gaps</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.gaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            : null}

            {result.recommendations.length > 0 ?
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Recommendations</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            : null}
          </div>
        }

        <DialogFooter className="gap-2 sm:gap-0">
          {result ?
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResult(null);
                  onResultChange?.(null);
                }}
                disabled={mutation.isPending}>
                Check again
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </>
          : <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAnalyze} disabled={mutation.isPending || !jobDescription.trim()}>
                {mutation.isPending ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                : "Analyze ATS score"}
              </Button>
            </>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AtsDialog;
