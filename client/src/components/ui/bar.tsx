import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "indeterminate" | "buffer" | "query" | "determinate";

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  // For determinate or buffer: percentage 0-100
  value?: number;
  // For buffer: secondary amount 0-100
  bufferValue?: number;
  label?: string;
}

const Bar = ({ className, variant = "indeterminate", value = 0, bufferValue = 0, label = "Loading…", ...props }: LinearProgressProps) => {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const bv = Math.max(0, Math.min(100, bufferValue ?? 0));

  // Accessibility: expose aria-valuenow only for determinate/buffer
  const isAriaDeterminate = variant === "determinate" || variant === "buffer";

  return (
    <div
      role="progressbar"
      aria-busy={variant === "indeterminate" || variant === "query" ? "true" : undefined}
      aria-valuemin={isAriaDeterminate ? 0 : undefined}
      aria-valuemax={isAriaDeterminate ? 100 : undefined}
      aria-valuenow={isAriaDeterminate ? Math.round(v) : undefined}
      className={cn("relative h-2 w-full overflow-hidden rounded-full", "bg-primary/20", className)}
      {...props}>
      {/* Buffer track (for buffer variant only) */}
      {variant === "buffer" ?
        <div
          className={cn("absolute inset-y-0 left-0 right-0 rounded-full", "bg-primary/40", "transition-transform duration-200 ease-linear")}
          style={{ transform: `translateX(-${100 - bv}%)` }}
        />
      : null}

      {/* Main bar(s) */}
      {variant === "determinate" ?
        <div
          className={cn("absolute inset-y-0 left-0 right-0 rounded-full bg-primary", "transition-transform duration-200 ease-linear")}
          style={{ transform: `translateX(-${100 - v}%)` }}
        />
      : null}

      {variant === "indeterminate" ?
        <>
          <div className="lp-bar absolute inset-y-0 left-0 rounded-full bg-primary animate-lp-indeterminate-1" />
          <div className="lp-bar absolute inset-y-0 left-0 rounded-full bg-primary animate-lp-indeterminate-2" />
        </>
      : null}

      {variant === "query" ?
        <>
          <div className="lp-bar absolute inset-y-0 left-0 rounded-full bg-primary animate-lp-query-1" />
          <div className="lp-bar absolute inset-y-0 left-0 rounded-full bg-primary animate-lp-query-2" />
        </>
      : null}

      <span className="sr-only">{label}</span>
    </div>
  );
};

export { Bar };
