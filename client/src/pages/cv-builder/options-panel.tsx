import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fontWeight, useCV } from "@/lib/useCV";
import { AlignCenter, AlignLeft, AlignRight, Italic, Strikethrough, Underline } from "lucide-react";
import React from "react";
import { ListIcon } from "./list-icons";

const ElementOptions = () => {
  const { selectedElement, updateElement } = useCV();
  if (!selectedElement || !selectedElement.properties) return null;

  const props = selectedElement.properties;
  const BULLET_ICONS: string[] = ['bullet', 'arrow', 'dash', 'check', 'number'];
  const FONT_WEIGHTS: {
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

  return (
    <div className="mt-4 rounded-lg border p-3 space-y-1">
      {/* FONT SIZE */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Size</Label>
        <Input
          type="number"
          value={props.fontSize ?? 14}
          onChange={(e) => {
            const value = Math.round(Number(e.target.value));
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                fontSize: value,
              },
            });
          }}

          className="w-32"
          step={1}
          min={8}
          max={72}
        />
      </div>

      {/* FONT WEIGHT */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Weight</Label>

        <Select
          value={props.fontWeight ?? "normal"}
          onValueChange={(value) =>
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                fontWeight: value as fontWeight,
              },
            })
          }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((fw) => (
              <SelectItem key={fw.value} value={fw.value} style={{ fontWeight: fw.css }}>
                {fw.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* FONT STYLE */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Style</Label>

        <ToggleGroup
          size="sm"
          type="multiple"
          variant="outline"
          value={[props.fontStyle?.strikethrough && "strikethrough", props.fontStyle?.italic && "italic", props.fontStyle?.underline && "underline"].filter(Boolean) as string[]}
          onValueChange={(value) => {
            if (!value) return;
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                fontStyle: {
                  strikethrough: value.includes("strikethrough"),
                  italic: value.includes("italic"),
                  underline: value.includes("underline"),
                },
              },
            });
          }}
          className="w-32 flex gap-2">
          <ToggleGroupItem value="normal">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ALIGNMENT */}
      {selectedElement.type != 'list' && <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Align</Label>

        <ToggleGroup
          size="sm"
          type="single"
          variant="outline"
          value={props.textAlign ?? "start"}
          onValueChange={(value) => {
            if (!value) return;
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                textAlign: value as "start" | "center" | "end",
              },
            });
          }}
          className="w-32 flex gap-2">
          <ToggleGroupItem value="start">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="end">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>}

      {/* TEXT COLOR */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Color</Label>
        <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
          <span className="w-6 h-6 block rounded-md border cursor-pointer" style={{ background: props.color ?? "#000000" }} />
          <input
            type="color"
            value={(props as any).color ?? "#000000"}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  color: e.target.value,
                },
              })
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {props.color ?? "#000000"}
        </label>
      </div>

      {/* BULLET ICONS */}
      {selectedElement.type === "list" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">
            Bullet Icon
          </Label>

          <ToggleGroup
            size="sm"
            type="single"
            variant="outline"
            value={props.listStyle?.icon ?? "bullet"}
            onValueChange={(value) => {
              if (!value) return;
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  listStyle: {
                    ...props.listStyle,
                    icon: value,
                  },
                },
              });
            }}
            className="flex gap-2"
          >
            {BULLET_ICONS.map((item, index) => (
              <ToggleGroupItem key={item} value={item}>
                <ListIcon element={item} index={index} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>)}
      {/* Bullet Color */}
      {selectedElement.type === "list" && (<div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">
          Bullet Color
        </Label>
        <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
          <span
            className="w-5 h-5 rounded border"
            style={{ background: props.listStyle?.iconColor ?? "#000000" }}
          />
          <input
            type="color"
            value={props.listStyle?.iconColor ?? "#000000"}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  listStyle: {
                    ...props.listStyle,
                    iconColor: e.target.value,
                  },
                },
              })
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {props.listStyle?.iconColor ?? "#000000"}
        </label>
      </div>

      )}
      {/* Date Formats */}
      {selectedElement.type === "date" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Date Format
          </Label>

          <Select
            value={props.dateFormat ?? "DD_MM_YYYY_TIME"}
            onValueChange={(value) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  dateFormat: value as any,
                },
              })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD">Day</SelectItem>
              <SelectItem value="MM">Month</SelectItem>
              <SelectItem value="YYYY">Year</SelectItem>
              <SelectItem value="MM_YYYY">Month Year</SelectItem>
              <SelectItem value="DD_MM_YYYY">Day Month Year</SelectItem>
              <SelectItem value="MM_YYYY_TIME">Month Year + Time</SelectItem>
              <SelectItem value="DD_MM_YYYY_TIME">Day Month Year + Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

    </div>
  );
};

export default ElementOptions;
