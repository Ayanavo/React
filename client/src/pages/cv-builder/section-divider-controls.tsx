import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCV } from "@/lib/useCV";
import React from "react";

const SectionDividerControls = () => {
  const { showSectionDividers, toggleSectionDividers, pageProperties, updatePageProperties } = useCV();

  return (
    <div className="space-y-3 px-2 py-2 rounded-md border border-border/50 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Section dividers</span>
        <Switch checked={showSectionDividers} onCheckedChange={toggleSectionDividers} />
      </div>

      {showSectionDividers && (
        <div className="space-y-2.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Divider color</Label>
            <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow bg-card">
              <span
                className="w-4 h-4 rounded border"
                style={{ background: pageProperties.dividerColor ?? "#e4e4e7" }}
              />
              <input
                type="color"
                value={pageProperties.dividerColor ?? "#e4e4e7"}
                onChange={(event) => updatePageProperties({ dividerColor: event.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-xs font-mono">{pageProperties.dividerColor ?? "#e4e4e7"}</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Divider style</Label>
            <Select
              value={pageProperties.dividerStyle ?? "solid"}
              onValueChange={(value) =>
                updatePageProperties({ dividerStyle: value as "solid" | "dashed" | "dotted" })
              }>
              <SelectTrigger className="w-32 h-8 text-xs bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDividerControls;
