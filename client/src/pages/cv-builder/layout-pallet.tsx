import React from "react";
import { useCV, type CVElement } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";

const LayoutPallet = () => {
  const { addSection, addBlock, selectedElementId, elements } = useCV();
  const sections = elements.filter((el) => el.type === "section");
  const sectionCount = sections.length - 1;

  const showBlockCount = (section: CVElement | undefined) => {
    if (!section) return null;
    const blocks = section.children ?? [];
    if (blocks.length === 0) return null;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{blocks.length}+</span>;
  };

  // Find selected section - either directly selected or parent of selected block
  const findSelectedSection = (): CVElement | undefined => {
    if (!selectedElementId) return undefined;

    // First check if the selected element is a section
    const directSection = elements.find((el) => el.id === selectedElementId && el.type === "section");
    if (directSection) return directSection;

    // If not, find which section contains the selected element (could be a block or content)
    const findParentSection = (nodes: typeof elements, targetId: string): CVElement | undefined => {
      for (const node of nodes) {
        if (node.type === "section" && node.children) {
          // Check if any child matches
          const found = node.children.find((child) => child.id === targetId);
          if (found) return node;

          // Recursively check children (for nested blocks/content)
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

    return findParentSection(elements, selectedElementId);
  };

  const selectedSection = findSelectedSection();

  return (
    <div className="space-y-2">
      {/* Add Section */}
      <button
        onClick={addSection}
        className="w-full flex items-center gap-2 px-6 py-4 rounded-md
                   bg-background text-foreground hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md text-sm font-medium group
                   border border-border">
        <LayoutPanelTop className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Section
        {sectionCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{sectionCount}+</span>}
      </button>

      {/* Add Block */}
      <button
        onClick={() => selectedSection && addBlock(selectedSection.id)}
        disabled={!selectedSection}
        className={`w-full flex items-center gap-2 px-6 py-4 rounded-md
          text-sm font-medium group border hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md
          ${selectedSection ? "bg-background text-foreground hover:bg-muted" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
        <Blocks className="w-6 h-6 opacity-60 group-hover:opacity-100" />
        Block
        {showBlockCount(selectedSection)}
      </button>

      {!selectedSection && <p className="text-xs text-muted-foreground">Select a section to add blocks</p>}
    </div>
  );
};

export default LayoutPallet;
