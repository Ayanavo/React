import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCV } from "@/lib/useCV";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Eye, GripHorizontal, GripVertical, Trash } from "lucide-react";
import React, { useRef, useState } from "react";
import CVElementRenderer from "./cv-element-renderer";
import CVPreview, { CVPreviewRef } from "./cv-preview";

const ZOOM = 1;
const MIN_SECTION_HEIGHT = 80;
const MIN_BLOCK_WIDTH = 60;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getSectionHeights = (sections: Array<{ height?: number }>) => {
  if (sections.length === 0) return [];

  const fallback = 100 / sections.length;
  const heights = sections.map((section) => (typeof section.height === "number" && section.height > 0 ? section.height : fallback));
  const total = heights.reduce((sum, height) => sum + height, 0);

  if (total <= 0) return sections.map(() => fallback);
  return heights.map((height) => (height / total) * 100);
};

const getBlockWidths = (blocks: Array<{ width?: number }>) => {
  if (blocks.length === 0) return [];

  const fallback = 100 / blocks.length;
  const widths = blocks.map((block) => (typeof block.width === "number" && block.width > 0 ? block.width : fallback));
  const total = widths.reduce((sum, w) => sum + w, 0);

  if (total <= 0) return blocks.map(() => fallback);
  return widths.map((w) => (w / total) * 100);
};

const Canvas = () => {
  const {
    elements,
    selectedPageId,
    selectedSectionId,
    A4_WIDTH,
    A4_HEIGHT,
    selectedBlockId,
    selectPage,
    selectSection,
    selectBlock,
    selectHeader,
    removeSection,
    removePage,
    clearSelection,
    pageProperties,
    showPagination,
    paginationLocation,
    updateElement,
  } = useCV();
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [blockDraggingSectionId, setBlockDraggingSectionId] = useState<string | null>(null);

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
  // const handleMouseDown = (pageIndex: number, sectionIndex: number, e: React.MouseEvent) => {
  //   setIsDragging(true);
  //   setDraggingIndex(pageIndex);
  //   const startY = e.clientY;
  //   const startHeight = A4_HEIGHT / (elements[pageIndex]?.children?.length ?? 1);

  //   const handleMouseMove = (moveEvent: MouseEvent) => {
  //     const deltaY = moveEvent.clientY - startY;
  //     const newHeight = Math.max(20, startHeight + (deltaY / A4_HEIGHT) * 100); // min height = 20px
  //     if (elements[pageIndex]?.children?.[sectionIndex]) {
  //       elements[pageIndex].children[sectionIndex].height = newHeight;
  //     }
  //   };

  //   const handleMouseUp = () => {
  //     setIsDragging(false);
  //     setDraggingIndex(null);
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);

  //   // Remove mouse event listeners if mouse leaves the canvas
  //   const handleMouseLeave = () => {
  //     if (isDragging) {
  //       setIsDragging(false);
  //       setDraggingIndex(null);
  //       window.removeEventListener("mousemove", handleMouseMove);
  //       window.removeEventListener("mouseup", handleMouseUp);
  //       window.removeEventListener("mouseleave", handleMouseLeave);
  //     }
  //   };

  //   window.addEventListener("mouseleave", handleMouseLeave);
  // };

  const handleSectionResizeStart = (pageIndex: number, sections: Array<{ id: string; height?: number }>, sectionIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeights = getSectionHeights(sections);
    const pairTotal = startHeights[sectionIndex] + startHeights[sectionIndex + 1];
    const minPercent = Math.min((MIN_SECTION_HEIGHT / A4_HEIGHT) * 100, pairTotal / 2);

    setIsDragging(true);
    setDraggingIndex(pageIndex);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPercent = ((moveEvent.clientY - startY) / A4_HEIGHT) * 100;
      const nextTopHeight = clamp(startHeights[sectionIndex] + deltaPercent, minPercent, pairTotal - minPercent);
      const nextHeights = [...startHeights];
      nextHeights[sectionIndex] = nextTopHeight;
      nextHeights[sectionIndex + 1] = pairTotal - nextTopHeight;

      sections.forEach((section, index) => {
        updateElement(section.id, { height: Number(nextHeights[index].toFixed(4)) });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingIndex(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleBlockResizeStart = (sectionId: string, blocks: Array<{ id: string; width?: number }>, blockIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidths = getBlockWidths(blocks);
    const pairTotal = startWidths[blockIndex] + startWidths[blockIndex + 1];
    const minPercent = Math.min((MIN_BLOCK_WIDTH / A4_WIDTH) * 100, pairTotal / 2);

    setIsBlockDragging(true);
    setBlockDraggingSectionId(sectionId);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPercent = ((moveEvent.clientX - startX) / A4_WIDTH) * 100;
      const nextLeftWidth = clamp(startWidths[blockIndex] + deltaPercent, minPercent, pairTotal - minPercent);
      const nextWidths = [...startWidths];
      nextWidths[blockIndex] = nextLeftWidth;
      nextWidths[blockIndex + 1] = pairTotal - nextLeftWidth;

      blocks.forEach((block, index) => {
        updateElement(block.id, { width: Number(nextWidths[index].toFixed(4)) });
      });
    };

    const handleMouseUp = () => {
      setIsBlockDragging(false);
      setBlockDraggingSectionId(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <aside className="flex flex-1 bg-secondary overflow-auto" onClick={() => clearSelection()}>
      <div
        className="flex flex-col items-center justify-center gap-10 p-4 w-full relative"
        style={{ pointerEvents: isDragging ? "none" : "auto", marginBlock: `${elements.length * 580}px` }} // Disable pointer events when dragging
      >
        {/* Render Pages Dynamically */}
        {elements.map((page, pageIndex) => {
          const sections = page.children ?? [];
          const sectionHeights = getSectionHeights(sections);

          return (
            <div
              key={page.id}
              className="relative"
              style={{
                pointerEvents: isDragging && draggingIndex !== pageIndex ? "none" : "auto", // Disable pointer events for other pages when dragging
              }}>
              {selectedPageId === page.id && (
                <div className="absolute top-4 -right-12 z-20">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => removePage(page.id)} className="bg-primary text-primary-foreground p-2 rounded shadow hover:opacity-80">
                          <Trash className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{elements.length === 1 ? "Reset Page" : "Delete Page"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <div className="flex w-full h-full">
                <div
                  ref={pageRef}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background relative"
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    transform: `scale(${ZOOM})`,
                    transformOrigin: "top center",
                    backgroundColor: pageProperties.backgroundColor ?? "#ffffff",
                    color: pageProperties.color ?? "#000000",
                    boxShadow: "rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px",
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

                  <div className="relative flex flex-col w-full h-full">
                    {showPagination && (
                      <div
                        className={`absolute z-20 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-muted-foreground ${
                          paginationLocation === "top-left" ? "top-4 left-4"
                          : paginationLocation === "top" ? "top-4 left-1/2 -translate-x-1/2"
                          : paginationLocation === "top-right" ? "top-4 right-4"
                          : paginationLocation === "bottom-left" ? "bottom-4 left-4"
                          : paginationLocation === "bottom" ? "bottom-4 left-1/2 -translate-x-1/2"
                          : "bottom-4 right-4"
                        }`}>
                        Page {pageIndex + 1} / {elements.length}
                      </div>
                    )}
                    {sections.map((section, sectionIndex) => {
                      const headerChild = section.children?.find((c) => c.type === "header");
                      const blockChildren = section.children?.filter((c) => c.type === "block") ?? [];

                      const isSectionSelected = selectedSectionId === section.id;
                      const isLastSection = sectionIndex === sections.length - 1;

                      return (
                        <div
                          key={section.id}
                          className={`relative flex flex-col w-full overflow-visible  ${isSectionSelected ? "ring-2 ring-ring" : ""} ${sectionIndex > 0 ? "my-[1px]" : "mb-[1px]"} ${!isLastSection ? "mb-1" : ""}`}
                          style={{ height: `${sectionHeights[sectionIndex]}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSection(page.id, section.id);
                          }}>
                          {isSectionSelected && sections.length > 1 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSection(section.id);
                                    }}
                                    className="absolute top-1 left-1 z-20 bg-secondary text-primary p-1 rounded shadow flex items-center gap-1">
                                    <Trash className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Delete section</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {/* ✅ HEADER (FULL WIDTH) */}
                          {headerChild && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                selectHeader(page.id, section.id, headerChild.id);
                              }}>
                              <CVElementRenderer element={headerChild} />
                            </div>
                          )}

                          {(() => {
                            const blockWidths = getBlockWidths(blockChildren);
                            return (
                          <div className="flex w-full flex-1" style={{ pointerEvents: isBlockDragging && blockDraggingSectionId !== section.id ? "none" : "auto" }}>
                            {blockChildren.map((block, blockIndex) => {
                              const isBlockSelected = selectedBlockId === block.id;
                              const isLastBlock = blockIndex === blockChildren.length - 1;

                              return (
                                <React.Fragment key={block.id}>
                                  <div
                                    className={`relative hover:bg-zinc-200 ${isBlockSelected ? "ring-2 ring-ring" : ""}`}
                                    style={{ width: `${blockWidths[blockIndex]}%` }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectPage(page.id);
                                      selectSection(page.id, section.id);
                                      selectBlock(page.id, section.id, block.id);
                                    }}>
                                    <CVElementRenderer element={block} blockCount={blockChildren.length} />
                                  </div>
                                  {/* ✅ VERTICAL BLOCK JOCKEY */}
                                  {!isLastBlock && isSectionSelected && (
                                    <div
                                      className="group relative z-20 w-3 cursor-ew-resize flex-shrink-0"
                                      style={{ marginInline: "-6px" }}
                                      onMouseDown={(e) => handleBlockResizeStart(section.id, blockChildren, blockIndex, e)}>
                                      <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px] bg-ring/40 group-hover:bg-ring transition-colors" />
                                      <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-muted shadow rounded-sm" />
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                            );
                          })()}

                          {/* ✅ SECTION DIVIDER */}
                          {isSectionSelected && (
                            <div className="group absolute bottom-0 left-4 right-4 z-20 h-3 translate-y-1/2 cursor-ns-resize" onMouseDown={(e) => handleSectionResizeStart(pageIndex, sections, sectionIndex, e)}>
                              <GripHorizontal className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 bg-muted shadow" />
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
      </div>

      {/* Preview Block */}
      <CVPreview ref={previewRef} />
    </aside>
  );
};

export default Canvas;
