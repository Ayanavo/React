import { Label } from "@/components/ui/label";
import { PillSlider } from "@/components/ui/pill-slider";
import { cn } from "@/lib/utils";
import React from "react";

type NumericSliderFieldProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showTicks?: boolean;
  onChange: (value: number) => void;
  className?: string;
};

function formatSliderValue(value: number, step: number, unit: string) {
  const rounded = step < 1 ? Number(value.toFixed(2)) : Math.round(value);
  if (unit === "px") return String(rounded);
  return `${rounded}${unit}`;
}

export function NumericSliderField({
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  showTicks,
  onChange,
  className,
}: NumericSliderFieldProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <Label className="text-xs font-medium text-muted-foreground text-wrap">{label}</Label>

      <PillSlider
        className="h-9 w-32 shrink-0"
        min={min}
        max={max}
        step={step}
        value={[value]}
        showTicks={showTicks}
        valueDisplay={formatSliderValue(value, step, unit)}
        onValueChange={([next]) => onChange(step < 1 ? next : Math.round(next))}
      />
    </div>
  );
}
