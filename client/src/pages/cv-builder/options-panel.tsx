import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fontWeight, useCV } from "@/lib/useCV";
import { AlignCenter, AlignLeft, AlignRight, ArrowRight, Dot, Italic, Minus, PlusIcon, Slash, Strikethrough, Underline } from "lucide-react";
import React from "react";
import { ListIcon } from "./list-icons";
import { Slider } from "@/components/ui/slider";

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
            value={props.dateFormat ?? "DD_MM_YYYY"}
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
              <SelectItem value="DD_MM_YYYY">24 03 2026</SelectItem>
              <SelectItem value="DD_MMM_YYYY">24 Mar 2026</SelectItem>
              <SelectItem value="DD_MMMM_YYYY">24 March 2026</SelectItem>
              <SelectItem value="MMM_YYYY">Mar 2026</SelectItem>
              <SelectItem value="MMMM_YYYY">March 2026</SelectItem>
              <SelectItem value="YYYY">2026</SelectItem>
            </SelectContent>
          </Select>

        </div>
      )}
      {selectedElement.type === "date" && (
        <>
          {/* Date format selector (existing) */}

          <div className="space-y-2 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Include time
            </Label>
            <Switch
              checked={props.includeTime ?? false}
              onCheckedChange={(checked) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...props,
                    includeTime: checked,
                  },
                })
              }
            />
          </div>
        </>
      )}

      {props.includeTime && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Time format
          </Label>

          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={props.timeFormat ?? "24"}
            onValueChange={(value) => {
              if (!value) return;
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  timeFormat: value as "24" | "12-lower" | "12-upper",
                },
              });
            }}
            className="flex gap-2"
          >
            <ToggleGroupItem value="24"> 24 </ToggleGroupItem>
            <ToggleGroupItem value="12-lower"> 12 am </ToggleGroupItem>
            <ToggleGroupItem value="12-upper"> 12 AM </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {selectedElement.type === "token" && <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Token background</Label>
        <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
          <span className="w-6 h-6 block rounded-md border cursor-pointer" style={{ background: props.tokenStyle?.backgroundColor ?? "#f1f5f9" }} />
          <input
            type="color"
            value={props.tokenStyle?.backgroundColor ?? "#f1f5f9"}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  tokenStyle: {
                    ...props.tokenStyle,
                    backgroundColor: e.target.value,
                  },
                },
              })
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {props.tokenStyle?.backgroundColor ?? "#f1f5f9"}
        </label>
      </div>
      }

      {selectedElement.type === "token" && <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border color</Label>
        <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
          <span className="w-6 h-6 block rounded-md border cursor-pointer" style={{ background: props.tokenStyle?.borderColor ?? "#cbd5e1" }} />
          <input
            type="color"
            value={props.tokenStyle?.borderColor ?? "#cbd5e1"}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  tokenStyle: {
                    ...props.tokenStyle,
                    borderColor: e.target.value,
                  },
                },
              })
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {props.tokenStyle?.borderColor ?? "#cbd5e1"}
        </label>
      </div>}

      {selectedElement.type === "token" && <div className="space-y-6 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border radius</Label>
        <Slider
          className="w-32"
          min={0}
          max={12}
          step={1}
          value={[props.tokenStyle?.radius ?? 6]}
          onValueChange={([value]) =>
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                tokenStyle: {
                  ...props.tokenStyle,
                  radius: Number(value),
                },
              },
            })
          }
        />
      </div>
      }
      {selectedElement.type === "token" && <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Add interlink
        </Label>
        <Switch
          checked={props.tokenInterlink?.enabled ?? false}
          onCheckedChange={(checked) =>
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                tokenInterlink: {
                  ...props.tokenInterlink,
                  enabled: checked,
                },
              },
            })
          }
        />
      </div>
      }

      {selectedElement.type === "token" && props.tokenInterlink?.enabled && (
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={props.tokenInterlink?.icon ?? "dot"}
          onValueChange={(value) => {
            if (!value) return;
            updateElement(selectedElement.id, {
              properties: {
                ...props,
                tokenInterlink: {
                  ...props.tokenInterlink,
                  icon: value as any,
                },
              },
            });
          }}
          className="flex gap-2 mt-2"
        >
          <ToggleGroupItem value="dot">
            <Dot className="w-4 h-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="slash">
            <Slash className="w-4 h-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="pipe">
            <Minus className="w-4 h-4 rotate-90" strokeWidth={2} />
          </ToggleGroupItem>

          <ToggleGroupItem value="arrow">
            <ArrowRight className="w-4 h-4" />
          </ToggleGroupItem>

          <ToggleGroupItem value="plus">
            <PlusIcon className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      {/* IMAGE OPTIONS */}
      {selectedElement.type === "image" && (
        <>
          {/* IMAGE SIZE */}
          <div className="space-y-2 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground text-nowrap">
              Image size
            </Label>
            <Slider
              className="w-32"
              min={0.2}
              max={3}
              step={0.05}
              value={[props.imageStyle?.imageScale ?? 1]}
              onValueChange={([value]) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...props,
                    imageStyle: {
                      ...props.imageStyle,
                      imageScale: value,
                    },
                  },
                })
              }
            />

          </div>

          {/* IMAGE RADIUS */}
          <div className="space-y-6 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground text-nowrap">
              Image radius
            </Label>
            <Slider
              className="w-32"
              min={0}
              max={60 * (props.imageStyle?.imageScale ?? 1)}
              step={1}
              value={[props.imageStyle?.radius ?? 6]}
              onValueChange={([value]) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...props,
                    imageStyle: {
                      ...props.imageStyle,
                      radius: Number(value),
                    },
                  },
                })
              }
            />
          </div>

          {/* BORDER ENABLE */}
          <div className="space-y-2 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Border
            </Label>
            <Switch
              checked={props.imageBorder?.enabled ?? false}
              onCheckedChange={(checked) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...props,
                    imageBorder: {
                      ...props.imageBorder,
                      enabled: checked,
                    },
                  },
                })
              }
            />
          </div>

          {/* BORDER COLOR */}
          {props.imageBorder?.enabled && (
            <>
              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">
                  Border color
                </Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span
                    className="w-5 h-5 rounded border"
                    style={{ background: props.imageBorder?.borderColor ?? "#000000" }}
                  />
                  <input
                    type="color"
                    value={props.imageBorder?.borderColor ?? "#000000"}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        properties: {
                          ...props,
                          imageBorder: {
                            ...props.imageBorder,
                            borderColor: e.target.value,
                          },
                        },
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {props.imageBorder?.borderColor ?? "#000000"}
                </label>
              </div>

              {/* BORDER WIDTH */}
              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">
                  Border width
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  step={1}
                  value={props.imageBorder?.borderWidth ?? 1}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      properties: {
                        ...props,
                        imageBorder: {
                          ...props.imageBorder,
                          borderWidth: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-32"
                />
              </div>

              {/* BORDER PADDING */}
              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">
                  Border padding
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={24}
                  step={1}
                  value={props.imageBorder?.padding ?? 0}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      properties: {
                        ...props,
                        imageBorder: {
                          ...props.imageBorder,
                          padding: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-32"
                />
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
};

export default ElementOptions;
