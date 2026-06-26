import { NumericSliderField } from "@/components/ui/numeric-slider-field";
import React from "react";
import { ELEMENT_GAP_MAX } from "./element-spacing";

type ElementSpacingControlsProps = {
  marginTop?: number;
  marginBottom?: number;
  onChange: (spacing: { marginTop?: number; marginBottom?: number }) => void;
};

const ElementSpacingControls = ({ marginTop, marginBottom, onChange }: ElementSpacingControlsProps) => (
  <div className="space-y-2">
    <NumericSliderField
      label="Gap above"
      value={marginTop ?? 0}
      min={0}
      max={ELEMENT_GAP_MAX}
      step={1}
      showTicks
      onChange={(gap) => onChange({ marginTop: gap })}
    />
    <NumericSliderField
      label="Gap below"
      value={marginBottom ?? 0}
      min={0}
      max={ELEMENT_GAP_MAX}
      step={1}
      showTicks
      onChange={(gap) => onChange({ marginBottom: gap })}
    />
  </div>
);

export default ElementSpacingControls;
