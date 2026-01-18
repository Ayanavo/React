import React from "react";
import { useCV, type CVElement } from "@/lib/useCV";
import { Blocks, LayoutPanelTop } from "lucide-react";

const LayoutPallet = () => {
  const { addSection, addBlock, selectedElementId, elements } = useCV();
  const sections = elements.filter((el) => el.type === "section");
  const sectionCount = sections.length - 1;
  
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
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md
                   bg-background text-foreground hover:bg-muted
                   transition-colors text-sm font-medium group
                   border border-border">
        <LayoutPanelTop className="w-4 h-4 opacity-60 group-hover:opacity-100" />
        Section
        {sectionCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{sectionCount}+</span>}
      </button>

      {/* Add Block */}
      <button
        onClick={() => selectedSection && addBlock(selectedSection.id)}
        disabled={!selectedSection}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
          text-sm font-medium group border transition-colors
          ${selectedSection ? "bg-background text-foreground hover:bg-muted" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
        <Blocks className="w-4 h-4 opacity-60 group-hover:opacity-100" />
        Block
      </button>

      {!selectedSection && <p className="text-xs text-muted-foreground">Select a section to add blocks</p>}
    </div>
  );
};

export default LayoutPallet;
