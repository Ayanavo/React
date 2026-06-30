import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import React from "react";

export type GenerationStepStatus = "pending" | "active" | "complete" | "error";

export type GenerationStep = {
  id: string;
  label: string;
  status: GenerationStepStatus;
};

type GenerationProgressDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  steps: GenerationStep[];
  errorMessage?: string | null;
};

function StepIcon({ status }: { status: GenerationStepStatus }) {
  if (status === "complete") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />;
  }

  if (status === "active") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />;
  }

  if (status === "error") {
    return <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />;
  }

  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />;
}

const GenerationProgressDialog = ({
  open,
  title,
  description,
  steps,
  errorMessage,
}: GenerationProgressDialogProps) => {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const progressValue = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const activeStep = steps.find((step) => step.status === "active");

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        hideClose
        className="max-w-md"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        aria-describedby={description ? "generation-progress-description" : undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ?
            <DialogDescription id="generation-progress-description">{description}</DialogDescription>
          : null}
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progressValue} aria-label="Generation progress" />

          <ol className="space-y-3" aria-live="polite" aria-busy={open}>
            {steps.map((step) => (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3 text-sm",
                  step.status === "active" && "font-medium text-foreground",
                  step.status === "pending" && "text-muted-foreground",
                  step.status === "complete" && "text-muted-foreground",
                  step.status === "error" && "text-destructive"
                )}>
                <StepIcon status={step.status} />
                <span>{step.label}</span>
              </li>
            ))}
          </ol>

          {activeStep ?
            <p className="text-sm text-muted-foreground">{activeStep.label}…</p>
          : null}

          {errorMessage ?
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationProgressDialog;
