import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import React from "react";
import { BUILDER_TOGGLE_GROUP_CLASS } from "./builder-control-styles";

export type TextAlign = "start" | "center" | "end";

type TextAlignControlsProps = {
  value?: TextAlign;
  onChange: (value: TextAlign) => void;
  label?: string;
  className?: string;
};

const TextAlignControls = ({ value = "start", onChange, label = "Align", className }: TextAlignControlsProps) => (
  <div className={cn("flex items-center justify-between gap-3", className)}>
    <Label className="text-xs font-medium text-muted-foreground text-wrap">{label}</Label>

    <ToggleGroup
      size="sm"
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        onChange(next as TextAlign);
      }}
      className={BUILDER_TOGGLE_GROUP_CLASS}>
      <ToggleGroupItem value="start" aria-label="Align left">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="end" aria-label="Align right">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
);

export default TextAlignControls;
