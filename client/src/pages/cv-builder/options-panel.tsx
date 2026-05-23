import Icon from "@/common/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fontWeight, useCV } from "@/lib/useCV";
import * as Iconlist from "lucide-react";
import { AlignCenter, AlignLeft, AlignRight, ArrowRight, Dot, Italic, Minus, PlusIcon, Slash, Strikethrough, Underline, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { ListIcon } from "./list-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DatePickerComponent from "../layout/activity/datepicker";

const ElementOptions = () => {
  const { selectedElement, updateElement } = useCV();
  if (!selectedElement || !selectedElement.properties) return null;

  const props = selectedElement.properties;
  const BULLET_ICONS: string[] = ["bullet", "arrow", "dash", "check", "number"];
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
  const ICON_LIST = Object.keys(Iconlist)
    .filter((key) => {
      if (key === "createLucideIcon") return false;
      if (key.endsWith("Icon")) return false;
      return /^[A-Z]/.test(key);
    })
    .map((key) => ({
      name: key.toLowerCase(),
      icon: key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const [search, setSearch] = useState("");
  const filteredIcons = useMemo(() => {
    return ICON_LIST.filter((entry) => entry.name.includes(search.toLowerCase())).slice(0, 100);
  }, [search]);
  const isPresetBulletIcon = (icon?: string) => BULLET_ICONS.includes(icon ?? "");

  const IconPicker = ({ value, onSelect }: { value?: string; onSelect: (icon: string) => void }) => {
    const selectedIconName = value ?? "Star";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-32 flex items-center gap-2 border rounded-md px-2 py-[6px] shadow cursor-pointer">
            <Icon icon={selectedIconName} customClass="w-4 h-4 shrink-0" />
            <span className="text-xs capitalize text-muted-foreground truncate flex-1">{selectedIconName}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 p-2 space-y-2">
          <div className="relative">
            <Input
              placeholder="Search icon..."
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8 pr-7"
            />

            {search && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearch("");
                }}
                onKeyDown={(e) => e.stopPropagation()}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            <TooltipProvider delayDuration={500}>
              {filteredIcons.map((item) => (
                <Tooltip key={item.icon}>
                  <TooltipTrigger asChild>
                    <div
                      className={`p-2 rounded cursor-pointer flex items-center justify-center border ${item.icon === selectedIconName ? "bg-muted border-primary" : "hover:bg-muted"}`}
                      onClick={() => {
                        onSelect(item.icon);
                        document.body.click();
                      }}>
                      <Icon icon={item.icon} customClass="w-4 h-4" />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top">
                    <span className="text-xs capitalize">{item.icon.replace(/([A-Z])/g, " $1")}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          {filteredIcons.length === 0 && <div className="text-xs text-muted-foreground text-center py-2">No icons found</div>}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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
      {selectedElement.type !== "icon" && (
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
            <ToggleGroupItem value="underline">
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
      )}

      {/* ALIGNMENT */}
      {selectedElement.type != "list" && (
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
        </div>
      )}

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

      {selectedElement.type === "text" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Add icon</Label>
          <Switch
            checked={props.showIcon ?? false}
            onCheckedChange={(checked) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  showIcon: checked,
                  icon: checked ? props.icon ?? "Star" : props.icon,
                },
              })
            }
          />
        </div>
      )}

      {selectedElement.type === "text" && props.showIcon && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Icon</Label>
          <IconPicker
            value={props.icon ?? "Star"}
            onSelect={(icon) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  showIcon: true,
                  icon,
                },
              })
            }
          />
        </div>
      )}

      {selectedElement.type === "text" && props.showIcon && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Icon Style</Label>
          <Select
            value={props.iconFill ?? "unfill"}
            onValueChange={(value) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  iconFill: value as "fill" | "unfill",
                },
              })
            }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unfill">Unfill</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* BULLET ICONS */}
      {selectedElement.type === "list" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Bullet Icon</Label>

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
            className="flex gap-2">
            {BULLET_ICONS.map((item, index) => (
              <ToggleGroupItem key={item} value={item}>
                <ListIcon element={item} index={index} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {selectedElement.type === "list" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Custom Icon</Label>
          <IconPicker
            value={isPresetBulletIcon(props.listStyle?.icon) ? "Star" : props.listStyle?.icon ?? "Star"}
            onSelect={(icon) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  listStyle: {
                    ...props.listStyle,
                    icon,
                  },
                },
              })
            }
          />
        </div>
      )}

      {selectedElement.type === "list" && !isPresetBulletIcon(props.listStyle?.icon) && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Icon Style</Label>
          <Select
            value={props.listStyle?.iconFill ?? "unfill"}
            onValueChange={(value) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  listStyle: {
                    ...props.listStyle,
                    iconFill: value as "fill" | "unfill",
                  },
                },
              })
            }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unfill">Unfill</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Bullet Color */}
      {selectedElement.type === "list" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Bullet Color</Label>
          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-5 h-5 rounded border" style={{ background: props.listStyle?.iconColor ?? "#000000" }} />
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
          <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Date Format</Label>

          <Select
            value={props.dateFormat ?? "DD_MM_YYYY"}
            onValueChange={(value) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  dateFormat: value as any,
                },
              })
            }>
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
            <Label className="text-xs font-medium text-muted-foreground">Include time</Label>
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

      {selectedElement.type === "date" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Pick date</Label>
          <DatePickerComponent
            date={selectedElement.content ? new Date(String(selectedElement.content)) : new Date()}
            onSendData={(d: Date) => {
              updateElement(selectedElement.id, {
                content: d.toISOString(),
              });
            }}
          />
        </div>
      )}

      {props.includeTime && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Time format</Label>

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
            className="flex gap-2">
            <ToggleGroupItem value="24"> 24 </ToggleGroupItem>
            <ToggleGroupItem value="12-lower"> 12 am </ToggleGroupItem>
            <ToggleGroupItem value="12-upper"> 12 AM </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {selectedElement.type === "token" && (
        <div className="space-y-2 flex items-center justify-between">
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
      )}

      {selectedElement.type === "token" && (
        <div className="space-y-2 flex items-center justify-between">
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
        </div>
      )}

      {selectedElement.type === "token" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border radius</Label>
          <Input
            type="number"
            step={1}
            min={0}
            max={24}
            value={props.tokenStyle?.radius ?? 6}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  tokenStyle: {
                    ...props.tokenStyle,
                    radius: Number(e.target.value),
                  },
                },
              })
            }
            className="w-32"
          />
        </div>
      )}

      {selectedElement.type === "token" && (
        <div className="space-y-6 flex items-center justify-between">
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
      )}
      {selectedElement.type === "token" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Add interlink</Label>
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
      )}

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
          className="flex gap-2 mt-2">
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
            <Label className="text-xs font-medium text-muted-foreground text-nowrap">Image size</Label>
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
            <Label className="text-xs font-medium text-muted-foreground text-nowrap">Image radius</Label>
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
            <Label className="text-xs font-medium text-muted-foreground">Border</Label>
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
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border color</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span className="w-5 h-5 rounded border" style={{ background: props.imageBorder?.borderColor ?? "#000000" }} />
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
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border width</Label>
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
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Border padding</Label>
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
