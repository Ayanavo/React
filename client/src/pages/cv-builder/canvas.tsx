import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCV } from "@/lib/useCV";
import { cn } from "@/lib/utils";
import {
  applyCaptureExpansion,
  getHtml2CanvasCaptureScale,
  prepareHtml2CanvasClone,
} from "@/shared/utils/html2canvas-capture";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import moment from "moment";
import { Download, Eye, GripHorizontal, GripVertical, Hand, Minus, Plus, Maximize2, Trash, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CVElementRenderer from "./cv-element-renderer";
import { formatCvPageLabel } from "./cv-page-pagination";
import { useParams } from "react-router-dom";
import "./cv-canvas.scss";

const MIN_SECTION_HEIGHT = 80;
const DEFAULT_CV_PAGE_BACKGROUND = "#ffffff";

const resolveCvPageBackground = (color?: string) => {
  const normalized = color?.trim();
  if (!normalized || normalized === "transparent") {
    return DEFAULT_CV_PAGE_BACKGROUND;
  }
  return normalized;
};

const CV_PAGE_PAGINATION_STYLE: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#64748b",
};
const MOBILE_CANVAS_PADDING = 16;
const DESKTOP_CANVAS_PADDING = 32;
const MIN_BLOCK_WIDTH = 60;
const PREVIEW_MIN_SCALE = 0.25;
const PREVIEW_MAX_SCALE = 6;
const PREVIEW_ZOOM_STEP = 0.15;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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

const sectionUsesFixedHeight = (section: { height?: number }) =>
  typeof section.height === "number" && section.height > 0;

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
    removeSection,
    removePage,
    clearSelection,
    commitEdits,
    pageProperties,
    showPagination,
    paginationLocation,
    paginationFormat,
    updateElement,
    showSectionDividers,
    cvName,
    onRequestSave,
    resolveExportFileName,
    setIsCapturing,
  } = useCV();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasScaleRef = useRef(canvasScale);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [blockDraggingSectionId, setBlockDraggingSectionId] = useState<string | null>(null);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewDimensions, setPreviewDimensions] = useState({ width: A4_WIDTH, height: A4_HEIGHT });
  const [previewCaptureScale, setPreviewCaptureScale] = useState(4);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const previewOverlayRef = useRef<HTMLDivElement>(null);
  const previewScaleRef = useRef(previewScale);
  const panOffsetRef = useRef(panOffset);
  const previewObjectUrlRef = useRef<string | null>(null);

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

  useEffect(() => {
    canvasScaleRef.current = canvasScale;
  }, [canvasScale]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const updateScale = () => {
      const padding = isMobile ? MOBILE_CANVAS_PADDING : DESKTOP_CANVAS_PADDING;
      const availableWidth = container.clientWidth - padding * 2;
      const nextScale = isMobile ? Math.min(availableWidth / A4_WIDTH, 1) : 1;
      setCanvasScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [A4_WIDTH, isMobile]);

  const scaledPageWidth = A4_WIDTH * canvasScale;
  const scaledPageHeight = A4_HEIGHT * canvasScale;

  const prepareCanvasCapture = useCallback(async () => {
    commitEdits();
    clearSelection();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }, [clearSelection, commitEdits]);

  const getScaleToFit = useCallback((logicalWidth: number, logicalHeight: number) => {
    const maxW = window.innerWidth * 0.85;
    const maxH = window.innerHeight * 0.85;
    return Math.min(maxW / logicalWidth, maxH / logicalHeight, 1);
  }, []);

  const revokePreviewObjectUrl = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokePreviewObjectUrl(), [revokePreviewObjectUrl]);

  const captureAllPages = useCallback(async () => {
    await prepareCanvasCapture();
    setIsCapturing(true);

    const captures: Array<{ canvas: HTMLCanvasElement; width: number; height: number; scale: number }> = [];

    try {
      for (const page of elements) {
        const pageEl = pageRefs.current.get(page.id);
        if (!pageEl) continue;

        const { width: captureWidth, height: captureHeight, restore } = applyCaptureExpansion(pageEl);

        if (captureWidth <= 0 || captureHeight <= 0) {
          restore();
          continue;
        }

        const captureScale = getHtml2CanvasCaptureScale();

        try {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });

          const canvas = await html2canvas(pageEl, {
            scale: captureScale,
            useCORS: true,
            backgroundColor: resolveCvPageBackground(pageProperties.backgroundColor),
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc, clonedPageEl) => {
              if (clonedPageEl instanceof HTMLElement) {
                prepareHtml2CanvasClone(clonedDoc, clonedPageEl, pageEl, {
                  width: captureWidth,
                  height: captureHeight,
                });
              }
            },
          });

          captures.push({
            canvas,
            width: canvas.width / captureScale,
            height: canvas.height / captureScale,
            scale: captureScale,
          });
        } finally {
          restore();
        }
      }

      return captures;
    } finally {
      setIsCapturing(false);
    }
  }, [elements, pageProperties.backgroundColor, prepareCanvasCapture, setIsCapturing]);

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

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      let offsetY = 0;
      for (const capture of captures) {
        const offsetX = Math.floor((maxWidth - capture.canvas.width) / 2);
        ctx.drawImage(capture.canvas, offsetX, offsetY);
        offsetY += capture.canvas.height;
      }

      const captureScale = captures[0]?.scale ?? getHtml2CanvasCaptureScale();
      const displayWidth = maxWidth / captureScale;
      const displayHeight = totalHeight / captureScale;
      const fitScale = getScaleToFit(displayWidth, displayHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        combined.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("Could not create preview image");
      }

      revokePreviewObjectUrl();
      const objectUrl = URL.createObjectURL(blob);
      previewObjectUrlRef.current = objectUrl;

      setPreviewCaptureScale(captureScale);
      setPreviewDimensions({ width: displayWidth, height: displayHeight });
      setPreviewImage(objectUrl);
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
  }, [captureAllPages, getScaleToFit, revokePreviewObjectUrl]);

  const closePreview = useCallback(() => {
    revokePreviewObjectUrl();
    setPreviewImage(null);
    setPanOffset({ x: 0, y: 0 });
  }, [revokePreviewObjectUrl]);

  const zoomIn = useCallback(
    () => setPreviewScale((s) => Math.min(s + PREVIEW_ZOOM_STEP, Math.max(PREVIEW_MAX_SCALE, previewCaptureScale))),
    [previewCaptureScale]
  );
  const zoomOut = useCallback(() => setPreviewScale((s) => Math.max(s - PREVIEW_ZOOM_STEP, PREVIEW_MIN_SCALE)), []);

  const handlePreviewWheel = useCallback(
    (e: WheelEvent) => {
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
      const maxZoom = Math.max(PREVIEW_MAX_SCALE, previewCaptureScale);
      const nextScale = clamp(currentScale * zoomFactor, PREVIEW_MIN_SCALE, maxZoom);
      const scaleRatio = nextScale / currentScale;

      if (scaleRatio === 1) return;

      setPanOffset({
        x: currentPan.x - pointerX * (scaleRatio - 1),
        y: currentPan.y - pointerY * (scaleRatio - 1),
      });
      setPreviewScale(nextScale);
    },
    [previewCaptureScale]
  );

  useEffect(() => {
    if (!previewImage) return;

    const overlay = previewOverlayRef.current;
    if (!overlay) return;

    overlay.addEventListener("wheel", handlePreviewWheel, { passive: false });
    return () => overlay.removeEventListener("wheel", handlePreviewWheel);
  }, [handlePreviewWheel, previewImage]);
  const resetZoom = useCallback(() => {
    setPreviewScale(getScaleToFit(previewDimensions.width, previewDimensions.height));
    setPanOffset({ x: 0, y: 0 });
  }, [getScaleToFit, previewDimensions.height, previewDimensions.width]);

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

  const handleTouchPanStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      setIsPanning(true);
      panStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y,
      };
    },
    [panOffset]
  );

  const handleTouchPanMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      setPanOffset({ x: panStart.current.offsetX + dx, y: panStart.current.offsetY + dy });
    },
    [isPanning]
  );

  const handleTouchPanEnd = useCallback(() => {
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
          const pageWidth = capture.canvas.width;
          const pageHeight = capture.canvas.height;

          if (!pdf) {
            pdf = new jsPDF("p", "px", [pageWidth, pageHeight]);
          } else {
            pdf.addPage([pageWidth, pageHeight]);
          }

          pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
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
    [captureAllPages]
  );

  const resolvePdfFileName = useCallback(() => {
    if (resolveExportFileName) {
      return resolveExportFileName();
    }

    return cvName.trim() || `CV_${moment().format("YYYY-MM-DD")}`;
  }, [resolveExportFileName, cvName]);

  const downloadPDF = useCallback(async () => {
    if (!id) {
      if (onRequestSave) {
        onRequestSave(() => {
          void generatePDF(resolvePdfFileName());
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

    await generatePDF(resolvePdfFileName());
  }, [id, onRequestSave, generatePDF, resolvePdfFileName]);

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
      const deltaPercent = ((moveEvent.clientY - startY) / (A4_HEIGHT * canvasScaleRef.current)) * 100;
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
      const deltaPercent = ((moveEvent.clientX - startX) / (A4_WIDTH * canvasScaleRef.current)) * 100;
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
    <aside
      ref={canvasContainerRef}
      className={cn(
        "relative flex flex-1 overflow-auto bg-secondary",
        isMobile && "overflow-x-hidden touch-pan-y"
      )}
      onClick={() => clearSelection()}>
      {/* Desktop: top-right action buttons */}
      <div
        className="absolute top-4 right-4 z-30 hidden flex-col gap-2 md:flex"
        data-cv-capture-ignore
        data-tutorial="builder-preview-download">
        <button
          type="button"
          onClick={() => void openPreview()}
          className="rounded-md bg-primary p-2 text-primary-foreground shadow transition hover:opacity-80"
          title="Preview CV">
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => void downloadPDF()}
          className="rounded-md bg-primary p-2 text-primary-foreground shadow transition hover:opacity-80"
          title="Download PDF">
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile: bottom-right floating action bar */}
      <div
        className="absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/95 p-1 shadow-lg backdrop-blur-sm md:hidden"
        data-cv-capture-ignore
        data-tutorial="builder-preview-download">
        <button
          type="button"
          onClick={() => void openPreview()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:opacity-80"
          aria-label="Preview CV">
          <Eye className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => void downloadPDF()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:opacity-80"
          aria-label="Download PDF">
          <Download className="h-5 w-5" />
        </button>
      </div>

      <div className="flex w-full min-h-full">
        <div
          className={cn(
            "relative m-auto flex w-full flex-col items-center",
            isMobile ? "gap-4 px-2 py-4 pb-24" : "gap-10 p-4"
          )}
          style={{ pointerEvents: isDragging ? "none" : "auto" }}>
          {/* Render Pages Dynamically */}
          {elements.map((page, pageIndex) => {
          const sections = page.children ?? [];
          const sectionHeights = getSectionHeights(sections);

          return (
            <div
              key={page.id}
              className="relative"
              style={{
                width: scaledPageWidth,
                height: scaledPageHeight,
                zIndex: selectedPageId === page.id ? 40 : 1,
                pointerEvents: isDragging && draggingIndex !== pageIndex ? "none" : "auto",
              }}>
              {selectedPageId === page.id && (
                <div
                  className={cn(
                    "absolute z-20",
                    isMobile ? "-top-3 -right-3" : "top-4 -right-12"
                  )}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => removePage(page.id)}
                          className={cn(
                            "rounded-full bg-primary text-primary-foreground shadow transition hover:opacity-80",
                            isMobile ? "flex h-9 w-9 items-center justify-center" : "p-2"
                          )}
                          aria-label={elements.length === 1 ? "Reset page" : "Delete page"}>
                          <Trash className={isMobile ? "h-4 w-4" : "h-4 w-4"} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side={isMobile ? "bottom" : "right"}>
                        {elements.length === 1 ? "Reset Page" : "Delete Page"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <div
                className="relative"
                style={{ width: scaledPageWidth, height: scaledPageHeight }}>
                <div
                  ref={(node) => setPageRef(page.id, node)}
                  data-cv-page={page.id}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-0 left-0"
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    overflow: "hidden",
                    transform: `scale(${canvasScale})`,
                    transformOrigin: "top left",
                    backgroundColor: resolveCvPageBackground(pageProperties.backgroundColor),
                    color: pageProperties.color ?? "#000000",
                    colorScheme: "light",
                    boxShadow: isMobile ?
                      "rgba(0, 0, 0, 0.12) 0px 8px 16px, rgba(0, 0, 0, 0.06) 0px 2px 6px"
                    : "rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px",
                  }}>
                  <div
                    className="relative flex h-full w-full flex-col">
                    {showPagination && (
                      <div
                        className={`absolute z-20 px-2 py-1 text-xs font-medium ${
                          paginationLocation === "top-left" ? "top-4 left-4"
                          : paginationLocation === "top" ? "top-4 left-1/2 -translate-x-1/2"
                          : paginationLocation === "top-right" ? "top-4 right-4"
                          : paginationLocation === "bottom-left" ? "bottom-4 left-4"
                          : paginationLocation === "bottom" ? "bottom-4 left-1/2 -translate-x-1/2"
                          : "bottom-4 right-4"
                        }`}
                        style={CV_PAGE_PAGINATION_STYLE}>
                        {formatCvPageLabel(paginationFormat, pageIndex + 1, elements.length)}
                      </div>
                    )}
                    {sections.map((section, sectionIndex) => {
                      const headerChild = section.children?.find((c) => c.type === "header");
                      const blockChildren = section.children?.filter((c) => c.type === "block") ?? [];

                      const isSectionSelected = selectedSectionId === section.id;
                      const isLastSection = sectionIndex === sections.length - 1;
                      const fixedHeight = sectionUsesFixedHeight(section);

                      return (
                        <div
                          key={section.id}
                          className={`relative flex flex-col w-full flex-shrink-0 overflow-visible ${fixedHeight ? "min-h-0" : ""} ${isSectionSelected ? "ring-2 ring-ring" : ""} ${sectionIndex > 0 ? "my-[1px]" : "mb-[1px]"} ${!isLastSection ? "mb-1" : ""}`}
                          style={
                            fixedHeight ?
                              { height: `${sectionHeights[sectionIndex]}%` }
                            : { height: "auto", flexShrink: 0 }
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSection(page.id, section.id);
                          }}>
                          {isSectionSelected && sections.length > 1 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSection(section.id);
                                    }}
                                    className={cn(
                                      "absolute top-1 left-1 z-20 flex items-center gap-1 rounded bg-secondary text-primary shadow",
                                      isMobile ? "p-1.5" : "p-1"
                                    )}
                                    aria-label="Delete section">
                                    <Trash className={isMobile ? "h-3.5 w-3.5" : "h-3 w-3"} />
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
                                className={`flex w-full items-start overflow-visible ${fixedHeight ? "min-h-0 flex-1" : ""}`}
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
                                          className={cn(
                                            "group relative z-20 flex-shrink-0 cursor-ew-resize self-stretch touch-none",
                                            isMobile ? "w-5" : "w-3"
                                          )}
                                          style={{ marginInline: isMobile ? "-8px" : "-6px" }}
                                          onMouseDown={(e) =>
                                            handleBlockResizeStart(section.id, blockChildren, blockIndex, e)
                                          }>
                                          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-muted-foreground/60" />
                                          <div
                                            className={cn(
                                              "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2px] border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-muted group-hover:text-foreground",
                                              isMobile ? "h-6 w-6" : "h-4 w-4"
                                            )}>
                                            <GripVertical className={isMobile ? "h-3.5 w-3.5" : "h-3 w-3"} />
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
                          {isSectionSelected && !isLastSection && fixedHeight && (
                            <div
                              className={cn(
                                "group absolute inset-x-0 bottom-0 z-30 translate-y-1/2 cursor-ns-resize touch-none",
                                isMobile ? "h-5" : "h-3"
                              )}
                              onMouseDown={(e) => handleSectionResizeStart(pageIndex, sections, sectionIndex, e)}>
                              <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-border transition-colors group-hover:bg-muted-foreground/60" />
                              <div
                                className={cn(
                                  "absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center rounded-[2px] border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-muted group-hover:text-foreground",
                                  isMobile ? "h-6 w-6" : "h-4 w-4"
                                )}>
                                <GripHorizontal className={isMobile ? "h-3.5 w-3.5" : "h-3 w-3"} />
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
      </div>

      {/* Preview Overlay – renders the captured canvas image */}
      {previewImage && (
        <div
          ref={previewOverlayRef}
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm"
          style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          onTouchStart={handleTouchPanStart}
          onTouchMove={handleTouchPanMove}
          onTouchEnd={handleTouchPanEnd}
          onTouchCancel={handleTouchPanEnd}>
          {/* Zoom & pan toolbar */}
          <div
            className={cn(
              "absolute z-[60] flex items-center gap-1 rounded-lg bg-black/70 px-3 py-1.5 shadow-lg",
              isMobile ?
                "top-[max(1rem,env(safe-area-inset-top,0px))] right-4 left-4 justify-between"
              : "top-4 right-4"
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={zoomOut}
              className="p-1 text-white/80 transition hover:text-white"
              title="Zoom out"
              aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs text-white select-none">
              {Math.round(previewScale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="p-1 text-white/80 transition hover:text-white"
              title="Zoom in"
              aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-white/30" />
            <button
              type="button"
              onClick={resetZoom}
              className="p-1 text-white/80 transition hover:text-white"
              title="Fit to screen"
              aria-label="Fit to screen">
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-white/30" />
            <button
              type="button"
              onClick={closePreview}
              className="p-1 text-white/80 transition hover:text-white"
              title="Close (Esc)"
              aria-label="Close preview">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hint */}
          <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/60 select-none">
            <Hand className="h-3 w-3" />
            {isMobile ? "Use +/- to zoom · Drag to pan" : "Scroll to zoom · Drag to pan"}
          </div>

          {/* Preview image — zoom via rendered size (keeps high-DPI source sharp) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))`,
              transformOrigin: "center center",
              willChange: "transform",
            }}>
            <img
              src={previewImage}
              alt="CV Preview"
              className="block max-w-none shadow-2xl rounded-sm"
              style={{
                width: previewDimensions.width * previewScale,
                height: previewDimensions.height * previewScale,
                imageRendering: "auto",
              }}
              width={Math.round(previewDimensions.width * previewCaptureScale)}
              height={Math.round(previewDimensions.height * previewCaptureScale)}
              draggable={false}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Canvas;
