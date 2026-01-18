import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCV } from "@/lib/useCV";
import { Trash } from "lucide-react";
import React from "react";
import CVElementRenderer from "./cv-element-renderer";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const ZOOM = 1;

const Canvas = () => {
  const { elements, selectedSectionId, selectedBlockId, showSectionDividers, selectSection, selectBlock, removeSection, removeBlock, clearSelection } = useCV();

  const sections = elements.filter((el) => el.type === "section");
  const canDeleteSection = sections.length > 1;

  const scaledA4Height = A4_HEIGHT * ZOOM;
  const scaledA4Width = A4_WIDTH * ZOOM;

  return (
    <aside className="flex flex-1 bg-gray-100 overflow-auto" onClick={() => clearSelection()}>
      <div className="flex justify-center p-4 w-full relative">
        <div
          className="bg-white shadow-lg relative"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${ZOOM})`,
            transformOrigin: "top center",
          }}>
          <div className="flex flex-col w-full h-full">
            {sections.map((section) => {
              const blocks = section.children ?? [];
              const canDeleteBlock = blocks.length > 1;
              const isSectionSelected = selectedSectionId === section.id;

              return (
                <div
                  key={section.id}
                  className={`relative flex w-full ${isSectionSelected ? "ring-2 ring-ring" : ""}`}
                  style={{ height: `${100 / sections.length}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSection(section.id);
                  }}>
                  <div className="flex w-full h-full">
                    {blocks.map((block, index) => {
                      const isBlockSelected = selectedBlockId === block.id;
                      const isLast = index === sections.length - 1;

                      return (
                        <div
                          key={block.id}
                          className={`relative flex-1 ${isBlockSelected ? "ring-2 ring-ring" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectBlock(section.id, block.id); // ✅ FIX
                          }}>
                          <CVElementRenderer element={block} />

                          {isBlockSelected && canDeleteBlock && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeBlock(block.id);
                                    }}
                                    className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow">
                                    <Trash className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Delete Block</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {showSectionDividers && !isLast && <div className="absolute bottom-0 left-4 right-4 h-px bg-border" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION DELETE BUTTONS */}
        <div
          className="absolute flex flex-col"
          style={{
            left: `calc(50% + ${scaledA4Width / 2}px + 16px)`,
            top: "16px",
            height: `${scaledA4Height}px`,
          }}>
          {sections.map((section) => {
            const sectionHeight = scaledA4Height / sections.length;
            const isActive = selectedSectionId === section.id;

            return (
              <div key={section.id} className="flex items-center justify-center" style={{ height: `${sectionHeight}px` }}>
                {isActive && canDeleteSection && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => removeSection(section.id)} className="bg-primary text-primary-foreground p-2 rounded shadow hover:opacity-80">
                          <Trash className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Delete Section</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Canvas;
