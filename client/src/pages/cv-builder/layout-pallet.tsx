import { Checkbox } from "@/components/ui/checkbox";
import { useCV, type CVElement } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";
import React from "react";

const LayoutPallet = () => {
  const { addSection, addBlock, showSectionDividers, selectedSectionId, toggleSectionDividers, MAX_SECTIONS, MAX_BLOCKS_PER_SECTION, elements } = useCV();
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
      <label className="flex items-center gap-2 px-1 py-2 rounded-md cursor-pointer select-none">
        <Checkbox checked={showSectionDividers} onCheckedChange={toggleSectionDividers} />
        <span className="text-xs text-foreground">Add sections dividers</span>
      </label>
    </div>
  );
};

export default LayoutPallet;
