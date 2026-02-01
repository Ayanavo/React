import { useCV } from "@/lib/useCV";
import React, { useState, useEffect, useRef } from "react";
import CVElementRenderer from "./cv-element-renderer";
import { ChevronsUpDown, Download, Eye, Trash, X } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CVPreview, { CVPreviewRef } from "./cv-preview";

const ZOOM = 1;

const Canvas = () => {
  const { elements, selectedSectionId, A4_WIDTH, A4_HEIGHT, showSectionDividers, selectedBlockId, selectPage, selectSection, selectBlock, removeSection, clearSelection, pageProperties } = useCV();


  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<CVPreviewRef>(null);



  const downloadPDF = async () => {
    if (!pageRef.current) return;

    const canvas = await html2canvas(pageRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "px", [A4_WIDTH, A4_HEIGHT]);

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);
    pdf.save(new Date() + ".pdf");
  };



  // Handle resizing
  const handleMouseDown = (pageIndex: number, sectionIndex: number, e: React.MouseEvent) => {
    setIsDragging(true);
    setDraggingIndex(pageIndex);
    const startY = e.clientY;
    const startHeight = A4_HEIGHT / (elements[pageIndex]?.children?.length ?? 1);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(20, startHeight + (deltaY / A4_HEIGHT) * 100); // min height = 20px
      if (elements[pageIndex]?.children?.[sectionIndex]) {
        elements[pageIndex].children[sectionIndex].height = newHeight;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingIndex(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Remove mouse event listeners if mouse leaves the canvas
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggingIndex(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    window.addEventListener("mouseleave", handleMouseLeave);
  };

  return (
    <aside className="flex flex-1 bg-secondary overflow-auto" onClick={() => clearSelection()}>
      <div
        className="flex flex-col items-center justify-center gap-10 p-4 w-full relative"
        style={{ pointerEvents: isDragging ? "none" : "auto" }} // Disable pointer events when dragging
      >
        {/* Render Pages Dynamically */}
        {elements.map((page, pageIndex) => {
          const sections = page.children ?? [];

          return (
            <div
              key={page.id}
              style={{
                pointerEvents: isDragging && draggingIndex !== pageIndex ? "none" : "auto", // Disable pointer events for other pages when dragging
              }}
              onClick={(e) => {
                e.stopPropagation();
                selectPage(page.id);
              }}>
              <div className="flex w-full h-full">
                <div
                  ref={pageRef}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background shadow-lg relative"
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    transform: `scale(${ZOOM})`,
                    transformOrigin: "top center",
                    backgroundColor: pageProperties.backgroundColor ?? "#ffffff",
                    color: pageProperties.color ?? "#000000",
                  }}>
                  {/* Floating actions (top-left of sheet) */}
                  <div
                    className="fixed flex flex-col gap-2 z-20"
                    style={{
                      right: `calc(50% + ${A4_WIDTH / 2}px + 16px)`,
                      top: "16px",
                    }}>
                    <button onClick={() => previewRef.current?.openPreview()} className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition" title="Preview CV">
                      <Eye className="h-4 w-4" />
                    </button>

                    <button onClick={downloadPDF} className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition" title="Download PDF">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-col w-full h-full">
                  {sections.map((section, sectionIndex) => {
                    const blocks = section.children ?? [];
                    const isSectionSelected = selectedSectionId === section.id;
                    const isLastSection = sectionIndex === sections.length - 1;

                    return (
                      <div
                        key={section.id}
                        className={`relative flex w-full ${isSectionSelected ? "ring-2 ring-ring" : ""}`}
                        style={{ height: `${100 / sections.length}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSection(page.id, section.id);
                        }}>
                        <div className="flex w-full h-full">
                          {blocks.map((block) => {
                            const isBlockSelected = selectedBlockId === block.id;

                            return (
                              <div
                                key={block.id}
                                className={`relative flex-1 hover:bg-zinc-200 ${isBlockSelected ? "ring-2 ring-ring" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectBlock(page.id, section.id, block.id);
                                }}>
                                <CVElementRenderer element={block} />
                              </div>
                            );
                          })}
                        </div>

                        {/* ✅ SECTION divider ONLY */}
                        {!isLastSection && (
                          <div
                            className={`absolute bottom-0 left-4 right-4 h-px cursor-pointer ${showSectionDividers && "bg-border"}`}
                            onMouseEnter={(e) => ((e.target as HTMLElement).style.cursor = "row-resize")}
                            onMouseLeave={(e) => ((e.target as HTMLElement).style.cursor = "default")}
                            onClick={(e) => e.stopPropagation()} // Stop propagation for the divider, but not for the icon
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute top-1/2 z-10 -translate-y-1/2 right-0 p-2 rounded-full bg-primary text-white"
                                    onMouseDown={(e) => handleMouseDown(pageIndex, sectionIndex, e)} // Handle resizing for sections inside pages
                                  >
                                    <ChevronsUpDown className="w-4 h-4 !cursor-row-resize" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">Resize Section</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* PAGE DELETE BUTTONS */}
        <div
          className="absolute flex flex-col"
          style={{
            left: `calc(50% + ${A4_WIDTH / 2}px + 16px)`,
            top: "16px",
            height: `${A4_HEIGHT}px`,
          }}>
          {elements.map((page) => {
            const pageHeight = A4_HEIGHT / elements.length;
            const isActive = selectedSectionId === page.id;

            return (
              <div key={page.id} className="flex items-center justify-center" style={{ height: `${pageHeight}px` }}>
                {isActive && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => removeSection(page.id)} className="bg-primary text-primary-foreground p-2 rounded shadow hover:opacity-80">
                          <Trash className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Delete Page</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Block */}
      <CVPreview ref={previewRef} />
    </aside>
  );
};

export default Canvas;
