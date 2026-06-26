import { Label } from "@/components/ui/label";
import { NumericSliderField } from "@/components/ui/numeric-slider-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CVElement, useCV } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";
import React from "react";
import SectionDividerControls from "./section-divider-controls";
import TextAlignControls from "./text-align-controls";

const findElementById = (items: CVElement[], id: string | null): CVElement | null => {
  if (!id) return null;

  for (const item of items) {
    if (item.id === id) return item;

    const child = findElementById(item.children ?? [], id);
    if (child) return child;
  }

  return null;
};

const LayoutPallet = () => {
  const {
    addSection,
    addBlock,
    addHeader,
    selectedSectionId,
    selectedPageId,
    selectedHeaderId,
    removeHeader,
    MAX_SECTIONS,
    MAX_BLOCKS_PER_SECTION,
    elements,
    updateElement,
    updatePageProperties,
    pageProperties,
    selectedElement,
  } = useCV();
  const selectedSection = findElementById(elements, selectedSectionId);
  const selectedHeader = findElementById(elements, selectedHeaderId);
  const selectedSectionHeader = selectedSection?.children?.find((child) => child.type === "header");
  const selectedElementAlignment = selectedElement?.properties?.textAlign ?? "start";
  const showSectionCount = () => {
    if (!selectedPageId) return 0;
    const page = elements.find((page) => page.id === selectedPageId);
    return (page?.children?.length ?? 0) - 1;
  };
  const showBlockCount = () => {
    if (!selectedPageId || !selectedSectionId) return 0;
    const page = elements.find((page) => page.id === selectedPageId);
    if (page && page?.children?.length) {
      const section = page.children.find((section) => section.id === selectedSectionId);
      return (section?.children?.length ?? 0) - 1;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <button
        onClick={() => selectedPageId && addSection(selectedPageId)}
        disabled={MAX_SECTIONS == showSectionCount()}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl
                   bg-card text-card-foreground hover:border-primary/50 hover:bg-accent/40 hover:shadow-md transition-all duration-300 group
                   border border-border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card">
        <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <LayoutPanelTop className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold leading-tight text-foreground">Add Section</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Create a new horizontal row</p>
        </div>
        <div className="shrink-0 text-xs px-2 py-1 rounded-md bg-muted border border-border font-medium text-muted-foreground group-hover:border-primary/30 transition-colors">
          {showSectionCount()}/{MAX_SECTIONS}
        </div>
      </button>

      {/* Add Block */}
      <button
        onClick={() => selectedPageId && selectedSectionId && addBlock(selectedPageId, selectedSectionId)}
        disabled={!selectedSectionId || MAX_BLOCKS_PER_SECTION == showBlockCount()}
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 group
          ${
            selectedSectionId ?
              "bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-accent/40 hover:shadow-md cursor-pointer"
            : "bg-muted/40 text-muted-foreground border-dashed border-border cursor-not-allowed opacity-60"
          }`}>
        <div
          className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all duration-300
          ${
            selectedSectionId ?
              "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            : "bg-muted text-muted-foreground"
          }`}>
          <Blocks className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p
            className={`text-sm font-semibold leading-tight ${selectedSectionId ? "text-foreground" : "text-muted-foreground"}`}>
            Add Block
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {selectedSectionId ? "Divide section into columns" : "Select a section first"}
          </p>
        </div>
        {selectedSectionId && (
          <div className="shrink-0 text-xs px-2 py-1 rounded-md bg-muted border border-border font-medium text-muted-foreground group-hover:border-primary/30 transition-colors">
            {showBlockCount()}/{MAX_BLOCKS_PER_SECTION}
          </div>
        )}
      </button>

      {/* Toggle Section Divider */}
      <SectionDividerControls />

      {/* Toggle Section Header */}
      <div className="flex items-center justify-between px-2 py-2 rounded-md">
        <span className="text-xs text-foreground">Add section header</span>
        <Switch
          checked={!!selectedSectionHeader}
          disabled={!selectedPageId || !selectedSectionId}
          onCheckedChange={(checked) => {
            if (!selectedPageId || !selectedSectionId) return;
            if (checked) {
              if (!selectedSectionHeader) addHeader(selectedPageId, selectedSectionId);
              return;
            }
            if (selectedSectionHeader) removeHeader(selectedSectionHeader.id);
          }}
        />
      </div>

      <div className="mt-4 rounded-lg border p-3 space-y-1">
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Page Background</Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span
              className="w-4 h-4 rounded border"
              style={{ background: pageProperties.backgroundColor ?? "#ffffff" }}
            />
            <input
              type="color"
              value={pageProperties.backgroundColor ?? "#ffffff"}
              onChange={(e) => updatePageProperties({ backgroundColor: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pageProperties.backgroundColor ?? "#ffffff"}
          </label>
        </div>

        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-wrap">Page Font Color</Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-4 h-4 rounded border" style={{ background: pageProperties.color ?? "#000000" }} />
            <input
              type="color"
              value={pageProperties.color ?? "#000000"}
              onChange={(e) => updatePageProperties({ color: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pageProperties.color ?? "#000000"}
          </label>
        </div>
      </div>

      {selectedElement &&
        ["text", "list", "date", "token", "image", "icon", "location"].includes(selectedElement.type) && (
          <div className="mt-4 rounded-lg border p-3 space-y-1">
            <TextAlignControls
              label="Alignment"
              value={selectedElementAlignment}
              onChange={(textAlign) =>
                updateElement(selectedElement.id, {
                  properties: {
                    ...selectedElement.properties,
                    textAlign,
                  },
                })
              }
            />
          </div>
        )}

      {/* Section Header */}
      {selectedHeaderId &&
        (() => {
          const headerElement = selectedHeader;
          if (!headerElement) return null;
          const headerStyle = headerElement.properties?.headerStyle;
          return (
            <div className="mt-4 rounded-lg border p-3 space-y-1">
              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-wrap">Header color</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span className="w-4 h-4 rounded border" style={{ background: headerStyle?.color ?? "#000000" }} />
                  <input
                    type="color"
                    value={headerStyle?.color ?? "#000000"}
                    onChange={(e) =>
                      updateElement(headerElement.id, {
                        properties: {
                          headerStyle: {
                            ...headerStyle,
                            color: e.target.value,
                          },
                        },
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {headerStyle?.color ?? "#000000"}
                </label>
              </div>

              <NumericSliderField
                label="Header size"
                value={headerStyle?.fontSize ?? 20}
                min={8}
                max={72}
                step={1}
                onChange={(fontSize) =>
                  updateElement(headerElement.id, {
                    properties: {
                      headerStyle: {
                        ...headerStyle,
                        fontSize,
                      },
                    },
                  })
                }
              />

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-wrap">Background</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span className="w-4 h-4 rounded border" style={{ background: headerStyle?.backgroundColor }} />
                  <input
                    type="color"
                    value={headerStyle?.backgroundColor ?? "#ffffff"}
                    onChange={(e) =>
                      updateElement(headerElement.id, {
                        properties: {
                          headerStyle: {
                            ...headerStyle,
                            backgroundColor: e.target.value,
                          },
                        },
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {headerStyle?.backgroundColor ?? "#ffffff"}
                </label>
              </div>

              <TextAlignControls
                label="Alignment"
                value={headerStyle?.textAlign ?? "start"}
                onChange={(textAlign) =>
                  updateElement(headerElement.id, {
                    properties: {
                      headerStyle: {
                        ...headerStyle,
                        textAlign,
                      },
                    },
                  })
                }
              />

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-wrap">Underline</Label>
                <Switch
                  checked={headerStyle?.underline?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateElement(headerElement.id, {
                      properties: {
                        headerStyle: {
                          ...headerStyle,
                          underline: {
                            ...headerStyle?.underline,
                            enabled: checked,
                          },
                        },
                      },
                    })
                  }
                />
              </div>

              {headerStyle?.underline?.enabled && (
                <>
                  <div className="space-y-2 flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground text-wrap">Underline width</Label>
                    <Select
                      value={headerStyle?.underline?.width ?? "fullWidth"}
                      onValueChange={(value) =>
                        updateElement(headerElement.id, {
                          properties: {
                            headerStyle: {
                              ...headerStyle,
                              underline: {
                                ...headerStyle?.underline,
                                width: value as "fullWidth" | "fitWidth",
                              },
                            },
                          },
                        })
                      }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullWidth">Full width</SelectItem>
                        <SelectItem value="fitWidth">Fit width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <NumericSliderField
                    label="Underline gap"
                    value={headerStyle?.underline?.gap ?? 4}
                    min={0}
                    max={32}
                    step={1}
                    onChange={(gap) =>
                      updateElement(headerElement.id, {
                        properties: {
                          headerStyle: {
                            ...headerStyle,
                            underline: {
                              ...headerStyle?.underline,
                              gap,
                            },
                          },
                        },
                      })
                    }
                  />
                </>
              )}
            </div>
          );
        })()}
    </div>
  );
};

export default LayoutPallet;
