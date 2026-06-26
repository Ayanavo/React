import { Label } from "@/components/ui/label";
import { NumericSliderField } from "@/components/ui/numeric-slider-field";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CVElement } from "@/lib/useCV";
import { cn } from "@/lib/utils";
import { ArrowRight, Dot, Minus, Plus, Slash } from "lucide-react";
import { BUILDER_TOGGLE_GROUP_WIDE_CLASS } from "./builder-control-styles";
import React from "react";

type TokenFormatControlsProps = {
  properties?: CVElement["properties"];
  onChange: (properties: CVElement["properties"]) => void;
  className?: string;
};

const TokenFormatControls = ({ properties, onChange, className }: TokenFormatControlsProps) => {
  const tokenStyle = properties?.tokenStyle;
  const tokenInterlink = properties?.tokenInterlink;

  const updateProperties = (updates: Partial<NonNullable<CVElement["properties"]>>) => {
    onChange({ ...properties, ...updates });
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-medium text-muted-foreground text-wrap">Token background</Label>
        <label className="relative flex w-32 shrink-0 items-center justify-between rounded-md border px-2 py-[6px] shadow">
          <span
            className="block h-4 w-4 cursor-pointer rounded-md border"
            style={{ background: tokenStyle?.backgroundColor ?? "#f1f5f9" }}
          />
          <input
            type="color"
            value={tokenStyle?.backgroundColor ?? "#f1f5f9"}
            onChange={(event) =>
              updateProperties({
                tokenStyle: {
                  ...tokenStyle,
                  backgroundColor: event.target.value,
                },
              })
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          {tokenStyle?.backgroundColor ?? "#f1f5f9"}
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-medium text-muted-foreground text-wrap">Border color</Label>
        <label className="relative flex w-32 shrink-0 items-center justify-between rounded-md border px-2 py-[6px] shadow">
          <span
            className="block h-4 w-4 cursor-pointer rounded border"
            style={{ background: tokenStyle?.borderColor ?? "#cbd5e1" }}
          />
          <input
            type="color"
            value={tokenStyle?.borderColor ?? "#cbd5e1"}
            onChange={(event) =>
              updateProperties({
                tokenStyle: {
                  ...tokenStyle,
                  borderColor: event.target.value,
                },
              })
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          {tokenStyle?.borderColor ?? "#cbd5e1"}
        </label>
      </div>

      <NumericSliderField
        label="Border radius"
        value={tokenStyle?.radius ?? 6}
        min={0}
        max={24}
        step={1}
        onChange={(radius) =>
          updateProperties({
            tokenStyle: {
              ...tokenStyle,
              radius,
            },
          })
        }
      />

      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Add interlink</Label>
        <Switch
          checked={tokenInterlink?.enabled ?? false}
          onCheckedChange={(enabled) =>
            updateProperties({
              tokenInterlink: {
                ...tokenInterlink,
                enabled,
              },
            })
          }
        />
      </div>

      {tokenInterlink?.enabled && (
        <div className="flex justify-end">
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={tokenInterlink.icon ?? "dot"}
            onValueChange={(value) => {
              if (!value) return;
              updateProperties({
                tokenInterlink: {
                  ...tokenInterlink,
                  icon: value as NonNullable<typeof tokenInterlink>["icon"],
                },
              });
            }}
            className={BUILDER_TOGGLE_GROUP_WIDE_CLASS}>
            <ToggleGroupItem value="dot" aria-label="Dot separator">
              <Dot className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="slash" aria-label="Slash separator">
              <Slash className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="pipe" aria-label="Pipe separator">
              <Minus className="h-4 w-4 rotate-90" strokeWidth={2} />
            </ToggleGroupItem>
            <ToggleGroupItem value="arrow" aria-label="Arrow separator">
              <ArrowRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="plus" aria-label="Plus separator">
              <Plus className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};

export default TokenFormatControls;
