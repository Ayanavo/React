import React from "react";
import { CVElement } from "@/lib/useCV";

interface OptionsPanelProps {
  element?: CVElement | null;
  onChange: (props: Record<string, any>) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ element, onChange }) => {
  if (!element) return null;

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
        Options
      </h4>

      {/* FONT SIZE */}
      {"fontSize" in (element.properties ?? {}) && (
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs">Font Size</label>
          <input
            type="number"
            className="w-16 px-2 py-1 text-xs border rounded"
            value={element.properties?.fontSize ?? 14}
            onChange={(e) =>
              onChange({ fontSize: Number(e.target.value) })
            }
          />
        </div>
      )}

      {/* FONT WEIGHT */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs">Weight</label>
        <select
          className="text-xs border rounded px-2 py-1"
          value={element.properties?.fontWeight ?? "400"}
          onChange={(e) =>
            onChange({ fontWeight: e.target.value })
          }
        >
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="700">Bold</option>
        </select>
      </div>

      {/* ALIGN */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs">Align</label>
        <select
          className="text-xs border rounded px-2 py-1"
          value={element.properties?.textAlign ?? "left"}
          onChange={(e) =>
            onChange({ textAlign: e.target.value })
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
};

export default OptionsPanel;