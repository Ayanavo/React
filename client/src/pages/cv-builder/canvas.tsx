import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCV } from "@/lib/useCV";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Eye, Trash, X } from "lucide-react";
import React, { useRef, useState } from "react";
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const pageRef = useRef<HTMLDivElement>(null);

  const getScaleToFit = () => {
    const maxWidth = window.innerWidth * 0.9; // 90% of viewport
    const maxHeight = window.innerHeight * 0.9; // 90% of viewport

    const scaleX = maxWidth / A4_WIDTH;
    const scaleY = maxHeight / A4_HEIGHT;

    return Math.min(scaleX, scaleY);
  };

  const openPreview = () => {
    setPreviewScale(getScaleToFit());
    setIsPreviewOpen(true);
  };

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

  const zoomIn = () =>
    setPreviewScale((s) => Math.min(s + 0.1, 2.5));

  const zoomOut = () =>
    setPreviewScale((s) => Math.max(s - 0.1, 0.4));

  const resetZoom = () =>
    setPreviewScale(getScaleToFit());


  return (
    <aside className="flex flex-1 bg-secondary overflow-auto" onClick={() => clearSelection()}>
      <div className="flex justify-center p-4 w-full relative">
        <div
          ref={pageRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-background shadow-lg relative"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${ZOOM})`,
            transformOrigin: "top center",
          }}>
          {/* Floating actions (top-left of sheet) */}
          <div
            className="fixed flex flex-col gap-2 z-20"
            style={{
              right: `calc(50% + ${scaledA4Width / 2}px + 16px)`,
              top: "16px",
            }}>
            <button onClick={() => openPreview()} className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition" title="Preview CV">
              <Eye className="h-4 w-4" />
            </button>

            <button onClick={downloadPDF} className="bg-primary text-primary-foreground rounded-md p-2 shadow hover:opacity-80 transition" title="Download PDF">
              <Download className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col w-full h-full">
            {sections.map((section) => {
              const blocks = section.children ?? [];
              const canDeleteBlock = blocks.length > 1;
              const isSectionSelected = selectedSectionId === section.id;

              return (
                <div
                  key={section.id}
                  className={`relative flex w-full ${isSectionSelected ? "ring-2 ring-ring" : ""} `}
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
                          className={`relative flex-1 hover:bg-zinc-200 ${isBlockSelected ? "ring-2 ring-ring" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectBlock(section.id, block.id);
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

      {/* Preview Block */}

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          {/* zoom options */}
          <div className="absolute top-2 right-2 z-30 flex gap-2 bg-black/70 rounded px-2 py-1">
            <button onClick={zoomOut} className="text-white px-2">-</button>
            <span className="text-white text-sm">
              {Math.round(previewScale * 100)}%
            </span>
            <button onClick={zoomIn} className="text-white px-2">+</button>
            <button onClick={resetZoom} className="text-white text-xs px-2">
              Fit
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <button className="absolute top-2 right-2 z-30 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition" onClick={() => setIsPreviewOpen(false)}>
              <X className="h-4 w-4" />
            </button>

            <div
              style={{
                width: A4_WIDTH * previewScale,
                height: A4_HEIGHT * previewScale,
              }}
              className="relative">
              <div
                className="bg-white shadow-2xl"
                style={{
                  width: A4_WIDTH,
                  height: A4_HEIGHT,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >

                <div className="flex flex-col w-full h-full pointer-events-none">
                  {sections.map((section) => (
                    <div key={section.id} className="flex w-full" style={{ height: `${100 / sections.length}%` }}>
                      {section.children?.map((block) => (
                        <div key={block.id} className="flex-1">
                          <CVElementRenderer element={block} readonly />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Canvas;
