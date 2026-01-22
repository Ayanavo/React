import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight, Italic, Bold, Type, Underline } from "lucide-react";
import { useCV } from "@/lib/useCV";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ElementOptions = () => {
  const { selectedElement, updateElement } = useCV();
  if (!selectedElement || !selectedElement.properties) return null;
  if (selectedElement.type !== "text") return null;

  const props = selectedElement.properties;

  return (
    <div className="mt-4 rounded-lg border p-3 space-y-1">
      {/* FONT SIZE */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Size</Label>
        <Input
          type="number"
          value={props.fontSize ?? 14}
          onChange={(e) =>
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                fontSize: Number(e.target.value),
              },
            })
          }
          className="w-32"
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
                fontWeight: value as "normal" | "bold" | "600" | "700",
              },
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select font weight" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="600">600</SelectItem>
            <SelectItem value="700">700</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
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
          value={[
          props.fontStyle?.bold && "bold",
          props.fontStyle?.italic && "italic",
          props.fontStyle?.underline && "underline",
        ].filter(Boolean) as string[]}
          onValueChange={(value) => {
            if (!value) return;
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                fontStyle: {
                bold: value.includes("bold"),
                italic: value.includes("italic"),
                underline: value.includes("underline"),
              },
              },
            });
          }}
          className="w-32 flex gap-2"
        >
          <ToggleGroupItem value="normal">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ALIGNMENT */}
      <div className="space-y-2 flex items-center justify-between">
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
          className="w-32 flex gap-2"
        >
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
      </div>

      {/* TEXT COLOR */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Color</Label>
         <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
      <span
          className="w-6 h-6 block rounded-md border cursor-pointer"
          style={{ background: props.color ?? "#000000" }}
        />
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
    </div>
  );
};

export default ElementOptions;
