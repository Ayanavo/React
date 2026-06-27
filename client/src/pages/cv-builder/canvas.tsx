import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { useCV } from "@/lib/useCV";
import { prepareHtml2CanvasClone } from "@/shared/utils/html2canvas-capture";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Eye, GripHorizontal, GripVertical, Hand, Minus, Plus, Maximize2, Trash, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CVElementRenderer from "./cv-element-renderer";
import { useParams } from "react-router-dom";

const ZOOM = 1;
const MIN_SECTION_HEIGHT = 80;
const MIN_BLOCK_WIDTH = 60;
const PREVIEW_MIN_SCALE = 0.3;
const PREVIEW_MAX_SCALE = 3;
const PREVIEW_ZOOM_STEP = 0.1;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const containsElementId = (node: { id: string; children?: Array<{ id: string; children?: unknown[] }> }, targetId: string): boolean => {
  if (node.id === targetId) return true;
  return node.children?.some((child) => containsElementId(child as typeof node, targetId)) ?? false;
};

const getSectionHeights = (sections: Array<{ height?: number }>) => {
  if (sections.length === 0) return [];

  const fallback = 100 / sections.length;
  const heights = sections.map((section) =>
    typeof section.height === "number" && section.height > 0 ? section.height : fallback
  );
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
    locationDropdownElementId,
    selectPage,
    selectSection,
    selectBlock,
    removeSection,
    removePage,
    clearSelection,
    commitEdits,
    pageProperties,
    showPagination,
    paginationLocation,
    updateElement,
    showSectionDividers,
    cvName,
    onRequestSave,
  } = useCV();
  const { id } = useParams();
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [blockDraggingSectionId, setBlockDraggingSectionId] = useState<string | null>(null);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewDimensions, setPreviewDimensions] = useState({ width: A4_WIDTH, height: A4_HEIGHT });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const previewOverlayRef = useRef<HTMLDivElement>(null);
  const previewScaleRef = useRef(previewScale);
  const panOffsetRef = useRef(panOffset);

  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setPageRef = useCallback((pageId: string, node: HTMLDivElement | null) => {
    if (node) {
      pageRefs.current.set(pageId, node);
    } else {
      pageRefs.current.delete(pageId);
    }
  }, []);

  useEffect(() => {
    previewScaleRef.current = previewScale;
  }, [previewScale]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  const prepareCanvasCapture = useCallback(async () => {
    commitEdits();
    clearSelection();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }, [clearSelection, commitEdits]);

  const getScaleToFit = useCallback(() => {
    const maxW = window.innerWidth * 0.85;
    const maxH = window.innerHeight * 0.85;
    return Math.min(maxW / A4_WIDTH, maxH / A4_HEIGHT, 1);
  }, [A4_WIDTH, A4_HEIGHT]);

  const captureAllPages = useCallback(async () => {
    await prepareCanvasCapture();

    const captures: Array<{ canvas: HTMLCanvasElement; width: number; height: number }> = [];

    for (const page of elements) {
      const pageEl = pageRefs.current.get(page.id);
      if (!pageEl) continue;

      const rect = pageEl.getBoundingClientRect();
      const captureWidth = rect.width;
      const captureHeight = rect.height;

      if (captureWidth <= 0 || captureHeight <= 0) continue;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        width: captureWidth,
        height: captureHeight,
        onclone: (clonedDoc, clonedPageEl) => {
          if (clonedPageEl instanceof HTMLElement) {
            prepareHtml2CanvasClone(clonedDoc, clonedPageEl, pageEl);
          }
        },
      });

      captures.push({ canvas, width: captureWidth, height: captureHeight });
    }

    return captures;
  }, [elements, prepareCanvasCapture]);

  const openPreview = useCallback(async () => {
    try {
      const captures = await captureAllPages();
      if (captures.length === 0) {
        showToast({ title: "Preview failed", description: "No CV pages were found to capture.", variant: "error" });
        return;
      }

      const maxWidth = Math.max(...captures.map((capture) => capture.canvas.width));
      const totalHeight = captures.reduce((sum, capture) => sum + capture.canvas.height, 0);
      const combined = document.createElement("canvas");
      combined.width = maxWidth;
      combined.height = totalHeight;

      const ctx = combined.getContext("2d");
      if (!ctx) {
        throw new Error("Could not create preview canvas");
      }

      let offsetY = 0;
      for (const capture of captures) {
        ctx.drawImage(capture.canvas, 0, offsetY);
        offsetY += capture.canvas.height;
      }

      const displayWidth = maxWidth / 2;
      const displayHeight = totalHeight / 2;
      const fitScale = Math.min(
        (window.innerWidth * 0.85) / displayWidth,
        (window.innerHeight * 0.85) / displayHeight,
        1,
      );

      setPreviewDimensions({ width: displayWidth, height: displayHeight });
      setPreviewImage(combined.toDataURL("image/png"));
      setPanOffset({ x: 0, y: 0 });
      setPreviewScale(fitScale);
    } catch (error) {
      console.error("CV preview failed:", error);
      showToast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Unable to generate preview",
        variant: "error",
      });
    }
  }, [captureAllPages]);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(
    () => setPreviewScale((s) => Math.min(s + PREVIEW_ZOOM_STEP, PREVIEW_MAX_SCALE)),
    []
  );
  const zoomOut = useCallback(
    () => setPreviewScale((s) => Math.max(s - PREVIEW_ZOOM_STEP, PREVIEW_MIN_SCALE)),
    []
  );

  const handlePreviewWheel = useCallback((e: WheelEvent) => {
    const overlay = previewOverlayRef.current;
    if (!overlay) return;

    e.preventDefault();

    const rect = overlay.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentPan = panOffsetRef.current;
    const pointerX = e.clientX - rect.left - centerX - currentPan.x;
    const pointerY = e.clientY - rect.top - centerY - currentPan.y;

    const currentScale = previewScaleRef.current;
    const zoomFactor = Math.exp(-e.deltaY * 0.002);
    const nextScale = clamp(currentScale * zoomFactor, PREVIEW_MIN_SCALE, PREVIEW_MAX_SCALE);
    const scaleRatio = nextScale / currentScale;

    if (scaleRatio === 1) return;

    setPanOffset({
      x: currentPan.x - pointerX * (scaleRatio - 1),
      y: currentPan.y - pointerY * (scaleRatio - 1),
    });
    setPreviewScale(nextScale);
  }, []);

  useEffect(() => {
    if (!previewImage) return;

    const overlay = previewOverlayRef.current;
    if (!overlay) return;

    overlay.addEventListener("wheel", handlePreviewWheel, { passive: false });
    return () => overlay.removeEventListener("wheel", handlePreviewWheel);
  }, [handlePreviewWheel, previewImage]);
  const resetZoom = useCallback(() => {
    setPreviewScale(getScaleToFit());
    setPanOffset({ x: 0, y: 0 });
  }, [getScaleToFit]);

  // Pan handlers
  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      // Only left-click
      if (e.button !== 0) return;
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, offsetX: panOffset.x, offsetY: panOffset.y };
    },
    [panOffset]
  );

  const handlePanMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPanOffset({ x: panStart.current.offsetX + dx, y: panStart.current.offsetY + dy });
    },
    [isPanning]
  );

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const generatePDF = useCallback(
    async (fileName: string) => {
      try {
        const captures = await captureAllPages();
        if (captures.length === 0) {
          showToast({ title: "Download failed", description: "No CV pages were found to export.", variant: "error" });
          return;
        }

        let pdf: jsPDF | null = null;

        for (const capture of captures) {
          const imgData = capture.canvas.toDataURL("image/png");

          if (!pdf) {
            pdf = new jsPDF("p", "px", [capture.width, capture.height]);
          } else {
            pdf.addPage([capture.width, capture.height]);
          }

          pdf.addImage(imgData, "PNG", 0, 0, capture.width, capture.height);
        }

        pdf?.save(`${fileName}.pdf`);
      } catch (error) {
        console.error("CV download failed:", error);
        showToast({
          title: "Download failed",
          description: error instanceof Error ? error.message : "Unable to generate PDF",
          variant: "error",
        });
      }
    },
    [captureAllPages],
  );

  const downloadPDF = useCallback(async () => {
    if (!id) {
      if (onRequestSave) {
        onRequestSave((savedName) => {
          const fileName = savedName || `CV_${new Date().toISOString().slice(0, 10)}`;
          void generatePDF(fileName);
        });
      } else {
        showToast({
          title: "Save required",
          description: "Save the CV first so it can be downloaded as a PDF.",
          variant: "warning",
        });
      }
      return;
    }

    const fileName = cvName || `CV_${new Date().toISOString().slice(0, 10)}`;
    await generatePDF(fileName);
  }, [id, cvName, onRequestSave, generatePDF]);

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

  const handleSectionResizeStart = (
    pageIndex: number,
    sections: Array<{ id: string; height?: number }>,
    sectionIndex: number,
    e: React.MouseEvent
  ) => {
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

  const handleBlockResizeStart = (
    sectionId: string,
    blocks: Array<{ id: string; width?: number }>,
    blockIndex: number,
    e: React.MouseEvent
  ) => {
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
    <aside className="relative flex flex-1 bg-secondary overflow-auto" onClick={() => clearSelection()}>
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2" data-cv-capture-ignore>
        <button
          type="button"
          onClick={() => void openPreview()}
          className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition"
          title="Preview CV">
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => void downloadPDF()}
          className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition"
          title="Download PDF">
          <Download className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-6 p-2 w-full relative md:gap-10 md:p-4"
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
                zIndex: selectedPageId === page.id ? 40 : 1,
                pointerEvents: isDragging && draggingIndex !== pageIndex ? "none" : "auto", // Disable pointer events for other pages when dragging
              }}>
              {selectedPageId === page.id && (
                <div className="absolute top-4 right-2 z-20 md:-right-12">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => removePage(page.id)}
                          className="bg-primary text-primary-foreground p-2 rounded shadow hover:opacity-80">
                          <Trash className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {elements.length === 1 ? "Reset Page" : "Delete Page"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <div className="flex w-full h-full">
                <div
                  ref={(node) => setPageRef(page.id, node)}
                  data-cv-page={page.id}
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
                      const hasOpenLocationDropdown =
                        Boolean(locationDropdownElementId) && containsElementId(section, locationDropdownElementId!);
                      const allowSectionOverflow = (isSectionSelected && !isLastSection) || hasOpenLocationDropdown;

                      return (
                        <div
                          key={section.id}
                          className={`relative flex flex-col w-full min-h-0 flex-shrink-0 ${allowSectionOverflow ? "overflow-visible" : "overflow-hidden"} ${isSectionSelected ? "ring-2 ring-ring" : ""} ${sectionIndex > 0 ? "my-[1px]" : "mb-[1px]"} ${!isLastSection ? "mb-1" : ""}`}
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
                            <div onClick={(e) => e.stopPropagation()}>
                              <CVElementRenderer element={headerChild} />
                            </div>
                          )}

                          {(() => {
                            const blockWidths = getBlockWidths(blockChildren);
                            return (
                              <div
                                className={`flex w-full min-h-0 flex-1 items-stretch ${hasOpenLocationDropdown ? "overflow-visible" : "overflow-hidden"}`}
                                style={{
                                  pointerEvents:
                                    isBlockDragging && blockDraggingSectionId !== section.id ? "none" : "auto",
                                }}>
                                {blockChildren.map((block, blockIndex) => {
                                  const isBlockSelected = selectedBlockId === block.id;
                                  const isLastBlock = blockIndex === blockChildren.length - 1;

                                  return (
                                    <React.Fragment key={block.id}>
                                      <div
                                        className={`relative ${isBlockSelected ? "bg-muted/40" : ""}`}
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
                                          className="group relative z-20 w-3 flex-shrink-0 cursor-ew-resize self-stretch"
                                          style={{ marginInline: "-6px" }}
                                          onMouseDown={(e) =>
                                            handleBlockResizeStart(section.id, blockChildren, blockIndex, e)
                                          }>
                                          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-muted-foreground/60" />
                                          <div className="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2px] border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-muted group-hover:text-foreground">
                                            <GripVertical className="h-3 w-3" />
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* ✅ SECTION DIVIDER LINE */}
                          {showSectionDividers && !isLastSection && (
                            <div
                              className="absolute bottom-0 left-0 right-0 pointer-events-none"
                              style={{
                                borderBottom: `2px ${pageProperties.dividerStyle ?? "solid"} ${pageProperties.dividerColor ?? "#e4e4e7"}`,
                                transform: "translateY(1px)",
                                zIndex: 10,
                              }}
                            />
                          )}

                          {/* ✅ SECTION RESIZE JOCKEY */}
                          {isSectionSelected && !isLastSection && (
                            <div
                              className="group absolute inset-x-0 bottom-0 z-30 h-3 translate-y-1/2 cursor-ns-resize"
                              onMouseDown={(e) => handleSectionResizeStart(pageIndex, sections, sectionIndex, e)}>
                              <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border transition-colors group-hover:bg-muted-foreground/60" />
                              <div className="absolute right-4 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-[2px] border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-muted group-hover:text-foreground">
                                <GripHorizontal className="h-3 w-3" />
                              </div>
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

      {/* Preview Overlay – renders the captured canvas image */}
      {previewImage && (
        <div
          ref={previewOverlayRef}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-hidden"
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}>
          {/* Zoom & pan toolbar */}
          <div
            className="absolute top-4 right-4 z-[60] flex items-center gap-1 rounded-lg bg-black/70 px-3 py-1.5 shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={zoomOut} className="text-white/80 hover:text-white p-1 transition" title="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-white text-xs min-w-[3rem] text-center select-none">
              {Math.round(previewScale * 100)}%
            </span>
            <button onClick={zoomIn} className="text-white/80 hover:text-white p-1 transition" title="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-white/30 mx-1" />
            <button onClick={resetZoom} className="text-white/80 hover:text-white p-1 transition" title="Fit to screen">
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-white/30 mx-1" />
            <button
              onClick={closePreview}
              className="text-white/80 hover:text-white p-1 transition"
              title="Close (Esc)">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 bg-black/50 text-white/60 text-xs px-3 py-1.5 rounded-full select-none pointer-events-none">
            <Hand className="h-3 w-3" /> Scroll to zoom · Drag to pan
          </div>

          {/* Preview image — pan/zoom via transform to avoid shrink-to-fit distortion */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${previewScale})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}>
            <img
              src={previewImage}
              alt="CV Preview"
              className="block max-w-none shadow-2xl rounded-sm"
              style={{
                width: previewDimensions.width,
                height: previewDimensions.height,
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Canvas;
