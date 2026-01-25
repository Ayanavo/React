import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { useCV, type CVElement } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";
import React from "react";

const LayoutPallet = () => {
  const { addSection, addBlock, showSectionDividers, selectedSectionId, toggleSectionDividers, MAX_SECTIONS, MAX_BLOCKS_PER_SECTION, elements, updatePageProperties, pageProperties } = useCV();
  const sections = elements.filter((el) => el.type === "section");
  const sectionCount = sections.length - 1;

  const showBlockCount = (section: CVElement | undefined) => {
    if (!section) return 0;
    const blocks = section.children ?? [];
    if (blocks.length === 0) return 0;
    return blocks.length - 1;
  };

  // Find selected section - either directly selected or parent of selected block
  const findSelectedSection = (): CVElement | undefined => {
    if (!selectedSectionId) return undefined;

    const directSection = elements.find((el) => el.id === selectedSectionId && el.type === "section");
    if (directSection) return directSection;

    const findParentSection = (nodes: typeof elements, targetId: string): CVElement | undefined => {
      for (const node of nodes) {
        if (node.type === "section" && node.children) {
          const found = node.children.find((child) => child.id === targetId);
          if (found) return node;
          for (const child of node.children) {
            if (child.children) {
              const nestedFound = child.children.find((c) => c.id === targetId);
              if (nestedFound) return node;
            }
          }
        }
      }
      return undefined;
    };

    return findParentSection(elements, selectedSectionId);
  };

  const selectedSection = findSelectedSection();

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <button
        onClick={addSection}
        disabled={MAX_SECTIONS == sectionCount}
        className="w-full flex items-center gap-2 px-6 py-6 rounded-md
                   bg-background text-foreground hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md text-lg font-medium group
                   border border-border">
        <LayoutPanelTop className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Section
        {sectionCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{sectionCount}+</span>}
      </button>

      {/* Add Block */}
      <button
        onClick={() => selectedSection && addBlock(selectedSection.id)}
        disabled={!selectedSection || MAX_BLOCKS_PER_SECTION == showBlockCount(selectedSection)}
        className={`w-full flex items-center gap-2 px-6 py-6 rounded-md
          text-lg font-medium group border hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md
          ${selectedSection ? "bg-background text-foreground hover:bg-muted" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
        <Blocks className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Block
        {showBlockCount(selectedSection) > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{showBlockCount(selectedSection)}+</span>}
      </button>

      {/* Toggle Section Divider */}
      <div className="flex items-center justify-between px-2 py-2 rounded-md">
        <span className="text-xs text-foreground">Add section dividers</span>
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
