import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCV } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";
import React from "react";

const LayoutPallet = () => {
  const { addSection, addBlock, showSectionDividers, selectedPageId, selectedSectionId, toggleSectionDividers, MAX_SECTIONS, MAX_BLOCKS_PER_SECTION, elements, updatePageProperties, pageProperties } = useCV();
  const showSectionCount = () => {
    if (!selectedPageId) return 0;
    const page = elements.find((page) => page.id === selectedPageId);
    return (page?.children?.length ?? 0) - 1;
  }

  const showBlockCount = () => {
    if (!selectedPageId || !selectedSectionId) return 0;
    const page = elements.find((page) => page.id === selectedPageId);
    if(page && page?.children?.length){
      const section = page.children.find((section) => section.id === selectedSectionId);
      return (section?.children?.length ?? 0)  - 1;
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
      <div className="flex items-center justify-between py-2 rounded-md">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap">Add section dividers</Label>
        <Switch
          checked={showSectionDividers}
          onCheckedChange={toggleSectionDividers}
        />
      </div>



      <div className="mt-4 rounded-lg border p-3 space-y-1">
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">
            Page Background
          </Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-5 h-5 rounded border"
              style={{ background: pageProperties.backgroundColor ?? "#ffffff" }}
            />
            <input
              type="color"
              value={pageProperties.backgroundColor ?? "#ffffff"}
              onChange={(e) =>
                updatePageProperties({ backgroundColor: e.target.value })
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pageProperties.backgroundColor ?? "#ffffff"}
          </label>
        </div>

        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap">
            Page Font Color
          </Label>

          <label className="relative flex w-32 justify-between items-center border rounded-md px-2 py-[6px] shadow">
            <span className="w-5 h-5 rounded border"
              style={{ background: pageProperties.color ?? "#000000" }}
            />
            <input
              type="color"
              value={pageProperties.color ?? "#000000"}
              onChange={(e) =>
                updatePageProperties({ color: e.target.value })
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pageProperties.color ?? "#000000"}
          </label>
        </div>
      </div>

    </div>
  );
};

export default LayoutPallet;
