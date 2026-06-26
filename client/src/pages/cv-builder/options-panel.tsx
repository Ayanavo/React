import Icon from "@/common/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericSliderField } from "@/components/ui/numeric-slider-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCV } from "@/lib/useCV";
import * as Iconlist from "lucide-react";
import {
  Columns2,
  Italic,
  Rows2,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { BUILDER_TOGGLE_GROUP_CLASS, BUILDER_TOGGLE_GROUP_WIDE_CLASS } from "./builder-control-styles";
import { ListIcon } from "./list-icons";
import ElementSpacingControls from "./element-spacing-controls";
import FontWeightControls from "./font-weight-controls";
import TextAlignControls from "./text-align-controls";
import TokenFormatControls from "./token-format-controls";
import { isSpacedElementType, TEXT_INDENT_MAX } from "./element-spacing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DatePickerComponent from "../layout/activity/datepicker";

const BULLET_ICONS: string[] = ["bullet", "arrow", "dash", "check", "number"];
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

const IconPicker = ({ value, onSelect }: { value?: string; onSelect: (icon: string) => void }) => {
  const [search, setSearch] = useState("");
  const selectedIconName = value ?? "Star";
  const filteredIcons = useMemo(() => {
    return ICON_LIST.filter((entry) => entry.name.includes(search.toLowerCase())).slice(0, 100);
  }, [search]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-32 flex items-center gap-2 border rounded-md px-2 py-[6px] shadow cursor-pointer">
          <Icon icon={selectedIconName} customClass="w-4 h-4 shrink-0" />
          <span className="text-xs capitalize text-muted-foreground truncate flex-1">{selectedIconName}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-2 space-y-2" onKeyDown={(e) => e.stopPropagation()}>
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

        {filteredIcons.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">No icons found</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ElementOptions = () => {
  const { selectedElement, updateElement } = useCV();
  if (!selectedElement || !selectedElement.properties) return null;

  const props = selectedElement.properties;
  const isPresetBulletIcon = (icon?: string) => BULLET_ICONS.includes(icon ?? "");

  return (
    <div className="mt-4 rounded-lg border p-3 space-y-1">
      {/* FONT SIZE */}
      <NumericSliderField
        label="Size"
        value={props.fontSize ?? 14}
        min={8}
        max={72}
        step={1}
        onChange={(value) =>
          updateElement(selectedElement.id, {
            properties: {
              ...props,
              fontSize: value,
            },
          })
        }
      />

      {/* FONT WEIGHT */}
      <FontWeightControls
        value={props.fontWeight ?? "normal"}
        onChange={(fontWeightValue) =>
          updateElement(selectedElement.id, {
            properties: {
              ...props,
              fontWeight: fontWeightValue,
            },
          })
        }
      />

      {/* FONT STYLE */}
      {selectedElement.type !== "icon" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Style</Label>

          <ToggleGroup
            size="sm"
            type="multiple"
            variant="outline"
            value={
              [
                props.fontStyle?.strikethrough && "strikethrough",
                props.fontStyle?.italic && "italic",
                props.fontStyle?.underline && "underline",
              ].filter(Boolean) as string[]
            }
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
            className={BUILDER_TOGGLE_GROUP_CLASS}>
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
      <TextAlignControls
        value={props.textAlign ?? "start"}
        onChange={(textAlign) =>
          updateElement(selectedElement.id, {
            properties: {
              ...props,
              textAlign,
            },
          })
        }
      />

      {isSpacedElementType(selectedElement.type) && (
        <>
          {["text", "list", "quote"].includes(selectedElement.type) && (
            <NumericSliderField
              label="Tab / indent"
              value={props.textIndent ?? 0}
              min={0}
              max={TEXT_INDENT_MAX}
              step={1}
              onChange={(indent) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...props,
                    textIndent: indent,
                  },
                })
              }
            />
          )}
          <ElementSpacingControls
            marginTop={props.marginTop}
            marginBottom={props.marginBottom}
            onChange={(spacing) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  ...spacing,
                },
              })
            }
          />
        </>
      )}

      {/* TEXT COLOR */}
      <div className="space-y-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground text-wrap">Color</Label>
        <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
          <span
            className="w-4 h-4 block rounded-md border cursor-pointer"
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
                  icon: checked ? (props.icon ?? "Star") : props.icon,
                },
              })
            }
          />
        </div>
      )}

      {selectedElement.type === "text" && props.showIcon && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Icon</Label>
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Icon Style</Label>
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Bullet Icon</Label>

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
            className={BUILDER_TOGGLE_GROUP_WIDE_CLASS}>
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Direction</Label>

          <ToggleGroup
            size="sm"
            type="single"
            variant="outline"
            value={props.listStyle?.direction ?? "column"}
            onValueChange={(value) => {
              if (!value) return;
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  listStyle: {
                    ...props.listStyle,
                    direction: value as "row" | "column",
                  },
                },
              });
            }}
            className={BUILDER_TOGGLE_GROUP_CLASS}>
            <ToggleGroupItem value="column" className="text-xs">
              <Rows2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="row" className="text-xs">
              <Columns2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {selectedElement.type === "list" && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Custom Icon</Label>
          <IconPicker
            value={isPresetBulletIcon(props.listStyle?.icon) ? "Star" : (props.listStyle?.icon ?? "Star")}
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Icon Style</Label>
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Bullet Color</Label>
          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-4 h-4 rounded border" style={{ background: props.listStyle?.iconColor ?? "#000000" }} />
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
          <Label className="text-xs font-medium text-muted-foreground text-wrap"> Date Format</Label>

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
            type="date"
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
            className={BUILDER_TOGGLE_GROUP_WIDE_CLASS}>
            <ToggleGroupItem value="24"> 24 </ToggleGroupItem>
            <ToggleGroupItem value="12-lower"> 12 am </ToggleGroupItem>
            <ToggleGroupItem value="12-upper"> 12 AM </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {selectedElement.type === "token" && (
        <TokenFormatControls
          properties={props}
          onChange={(nextProperties) =>
            updateElement(selectedElement.id, {
              properties: nextProperties,
            })
          }
        />
      )}

      {/* IMAGE OPTIONS */}
      {selectedElement.type === "image" && (
        <>
          <NumericSliderField
            label="Image size"
            value={props.imageStyle?.imageScale ?? 1}
            min={0.2}
            max={3}
            step={0.05}
            unit="x"
            onChange={(imageScale) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  imageStyle: {
                    ...props.imageStyle,
                    imageScale,
                  },
                },
              })
            }
          />

          <NumericSliderField
            label="Image radius"
            value={props.imageStyle?.radius ?? 6}
            min={0}
            max={60 * (props.imageStyle?.imageScale ?? 1)}
            step={1}
            onChange={(radius) =>
              updateElement(selectedElement.id, {
                properties: {
                  ...props,
                  imageStyle: {
                    ...props.imageStyle,
                    radius,
                  },
                },
              })
            }
          />

          {/* BORDER ENABLE */}
          <div className="space-y-2 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground text-wrap">Border</Label>
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
                <Label className="text-xs font-medium text-muted-foreground text-wrap">Border color</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span
                    className="w-4 h-4 rounded border"
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

              <NumericSliderField
                label="Border width"
                value={props.imageBorder?.borderWidth ?? 1}
                min={0}
                max={12}
                step={1}
                onChange={(borderWidth) =>
                  updateElement(selectedElement.id, {
                    properties: {
                      ...props,
                      imageBorder: {
                        ...props.imageBorder,
                        borderWidth,
                      },
                    },
                  })
                }
              />

              <NumericSliderField
                label="Border padding"
                value={props.imageBorder?.padding ?? 0}
                min={0}
                max={24}
                step={1}
                onChange={(padding) =>
                  updateElement(selectedElement.id, {
                    properties: {
                      ...props,
                      imageBorder: {
                        ...props.imageBorder,
                        padding,
                      },
                    },
                  })
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ElementOptions;
