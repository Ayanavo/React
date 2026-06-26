import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fontWeight } from "@/lib/useCV";
import { cn } from "@/lib/utils";
import React from "react";

export const FONT_WEIGHT_OPTIONS: {
  label: string;
  value: fontWeight;
  css: number;
}[] = [
  { label: "Light", value: "light", css: 300 },
  { label: "Normal", value: "normal", css: 400 },
  { label: "Medium", value: "medium", css: 500 },
  { label: "Semi Bold", value: "semi-bold", css: 600 },
  { label: "Bold", value: "bold", css: 700 },
];

type FontWeightControlsProps = {
  value?: fontWeight;
  onChange: (value: fontWeight) => void;
  label?: string;
  className?: string;
};

const FontWeightControls = ({ value = "normal", onChange, label = "Weight", className }: FontWeightControlsProps) => (
  <div className={cn("flex items-center justify-between gap-3", className)}>
    <Label className="text-xs font-medium text-muted-foreground text-wrap">{label}</Label>

    <Select value={value} onValueChange={(next) => onChange(next as fontWeight)}>
      <SelectTrigger className="w-32 shrink-0">
        <SelectValue placeholder="Select weight" />
      </SelectTrigger>
      <SelectContent>
        {FONT_WEIGHT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} style={{ fontWeight: option.css }}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default FontWeightControls;
