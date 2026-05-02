import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCV } from "@/lib/useCV";
import { AlignCenter, AlignLeft, AlignRight, Blocks, LayoutPanelTop } from "lucide-react";
import React from "react";

const LayoutPallet = () => {
  const {
    addSection,
    addBlock,
    addHeader,
    showSectionDividers,
    selectedSectionId,
    selectedPageId,
    selectedHeaderId,
    toggleSectionDividers,
    MAX_SECTIONS,
    MAX_BLOCKS_PER_SECTION,
    elements,
    updateElement,
    updatePageProperties,
    pageProperties,
  } = useCV();
  const selectedSection = elements.find((el) => el.id === selectedSectionId);
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
        className="w-full flex items-center gap-2 px-6 py-6 rounded-md
                   bg-background text-foreground hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md text-lg font-medium group
                   border border-border">
        <LayoutPanelTop className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Section
        {showSectionCount() > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{showSectionCount()}+</span>}
      </button>

      {/* Add Block */}
      <button
        onClick={() => selectedPageId && selectedSectionId && addBlock(selectedPageId, selectedSectionId)}
        disabled={!selectedSectionId || MAX_BLOCKS_PER_SECTION == showBlockCount()}
        className={`w-full flex items-center gap-2 px-6 py-6 rounded-md
          text-lg font-medium group border hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md
          ${selectedSectionId ? "bg-background text-foreground hover:bg-muted" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
        <Blocks className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Block
        {showBlockCount() > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{showBlockCount()}+</span>}
      </button>

      {/* Toggle Section Divider */}
      <div className="flex items-center justify-between px-2 py-2 rounded-md">
        <span className="text-xs text-foreground">Add section dividers</span>
        <Switch checked={showSectionDividers} onCheckedChange={toggleSectionDividers} />
      </div>

      {/* Add Section Header */}
      <button
        onClick={() => {
          selectedPageId && selectedSectionId && addHeader(selectedPageId, selectedSectionId);
        }}
        disabled={!!selectedHeaderId}
        className={`w-full px-3 py-2 rounded-md text-xs font-medium transition-all
          ${
            selectedSectionId && !(selectedSection?.children ?? []).some((c) => c.type === "header") ?
              "bg-background border-primary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}>
        Add section header
      </button>

      <div className="mt-4 rounded-lg border p-3 space-y-1">
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Page Background</Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-5 h-5 rounded border" style={{ background: pageProperties.backgroundColor ?? "#ffffff" }} />
            <input type="color" value={pageProperties.backgroundColor ?? "#ffffff"} onChange={(e) => updatePageProperties({ backgroundColor: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {pageProperties.backgroundColor ?? "#ffffff"}
          </label>
        </div>

        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">Page Font Color</Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-5 h-5 rounded border" style={{ background: pageProperties.color ?? "#000000" }} />
            <input type="color" value={pageProperties.color ?? "#000000"} onChange={(e) => updatePageProperties({ color: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {pageProperties.color ?? "#000000"}
          </label>
        </div>
      </div>

      <div>{selectedHeaderId}</div>
      {/* Section Header */}
      {selectedHeaderId &&
        (() => {
          const headerElement = elements.find((el) => el.id === selectedHeaderId);
          if (!headerElement) return null;
          const headerStyle = headerElement.properties?.headerStyle;
          return (
            <div className="mt-4 rounded-lg border p-3 space-y-1">
              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Header color</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span className="w-5 h-5 rounded border" style={{ background: headerStyle?.color ?? "#000000" }} />
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

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Header size</Label>
                <Input
                  type="number"
                  value={headerStyle?.fontSize ?? 20}
                  onChange={(e) =>
                    updateElement(headerElement.id, {
                      properties: {
                        headerStyle: {
                          ...headerStyle,
                          fontSize: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-32"
                  step={1}
                  min={8}
                  max={72}
                />
              </div>

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Background</Label>
                <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
                  <span className="w-5 h-5 rounded border" style={{ background: headerStyle?.backgroundColor }} />
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

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Alignment</Label>
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={headerStyle?.textAlign ?? "start"}
                  onValueChange={(value) =>
                    updateElement(headerElement.id, {
                      properties: {
                        headerStyle: {
                          ...headerStyle,
                          textAlign: value as "start" | "center" | "end",
                        },
                      },
                    })
                  }
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

              <div className="space-y-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground text-nowrap">Underline</Label>
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
                    <Label className="text-xs font-medium text-muted-foreground text-nowrap">Underline width</Label>
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

                  <div className="space-y-2 flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground text-nowrap">Underline gap</Label>
                    <Input
                      type="number"
                      value={headerStyle?.underline?.gap ?? 4}
                      onChange={(e) =>
                        updateElement(headerElement.id, {
                          properties: {
                            headerStyle: {
                              ...headerStyle,
                              underline: {
                                ...headerStyle?.underline,
                                gap: Number(e.target.value),
                              },
                            },
                          },
                        })
                      }
                      className="w-32"
                      step={1}
                      min={0}
                      max={32}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })()}
    </div>
  );
};

export default LayoutPallet;
