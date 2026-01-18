import { useCV } from "@/lib/useCV";
import { Trash } from "lucide-react";
import React from "react";
import CVElementRenderer from "./cv-element-renderer";
import { TooltipProvider, Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { TooltipContent } from "@/components/ui/tooltip";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const ZOOM = 1;

const Canvas = () => {
  const { elements, selectedElementId, selectElement, removeSection, removeBlock } = useCV();

  const sections = elements.filter((el) => el.type === "section");
  const canDeleteSection = sections.length > 1;

  const scaledA4Height = A4_HEIGHT * ZOOM;
  const scaledA4Width = A4_WIDTH * ZOOM;

  return (
    <aside className="flex flex-1 bg-gray-100 overflow-auto">
      <div className="flex justify-center p-4 w-full relative">
        <div
          className="bg-white shadow-lg relative"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${ZOOM})`,
            transformOrigin: "top center",
          }}>
          {/* A4 PAGE */}
          <div className="flex flex-col w-full h-full">
            {sections.map((section) => {
              const blocks = section.children ?? [];
              const canDeleteBlock = blocks.length > 1;
              const isSectionSelected = selectedElementId === section.id;

              return (
                <div
                  key={section.id}
                  className={`relative flex w-full transition ${isSectionSelected ? "ring-2 ring-ring" : ""}`}
                  style={{ height: `${100 / sections.length}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectElement(section.id);
                  }}>
                  {/* BLOCKS */}
                  <div className="flex w-full h-full">
                    {blocks.map((block) => {
                      const isBlockSelected = selectedElementId === block.id;

                      return (
                        <div
                          key={block.id}
                          className={`relative flex-1  ${isBlockSelected ? "ring-2 ring-ring" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectElement(block.id);
                          }}>
                          <CVElementRenderer element={block} />

                          {/* Delete block */}
                          {isBlockSelected && canDeleteBlock && (
                            <TooltipProvider disableHoverableContent>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeBlock(block.id);
                                    }}
                                    className="absolute top-2 right-2
                                               bg-secondary text-secondary-foreground
                                               p-1 rounded shadow">
                                    <Trash className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Delete Block</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete section buttons - positioned in grey area to the right of the document */}
        <div
          className="absolute flex flex-col ml-5"
          style={{
            left: `calc(50% + ${scaledA4Width / 2}px + 16px)`,
            top: "16px",
            height: `${scaledA4Height}px`,
            transform: "translateX(-50%)",
          }}>
          {sections.map((section) => {
            const isSectionSelected = selectedElementId === section.id || section.children?.some((child) => child.id === selectedElementId);
            const sectionHeight = scaledA4Height / sections.length;

            return (
              <div key={section.id} className="flex items-center justify-center" style={{ height: `${sectionHeight}px` }}>
                {isSectionSelected && canDeleteSection && (
                  <TooltipProvider disableHoverableContent>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(section.id);
                          }}
                          className="bg-primary text-primary-foreground
                                     p-2 rounded shadow hover:opacity-80 transition-opacity
                                     flex items-center justify-center">
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
