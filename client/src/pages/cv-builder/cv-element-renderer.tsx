import { type CVElement, useCV } from "@/lib/useCV";
import React, { useRef } from "react";
import { Trash } from "lucide-react";
import CvListRenderer from "./cv-list-renderer";
import CvTextRenderer from "./cv-text-renderer";
import CvDateRenderer from "./cv-date-renderer";
import CvTokenRenderer from "./cv-token-renderer";
import CvImageRenderer from "./cv-image-renderer";
import CvIconRenderer from "./cv-icon-renderer";
import CvLocationRenderer from "./cv-location-renderer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CVElementRenderer = ({
  element,
  sectionCount,
  blockCount,
  readonly = false,
}: {
  element: CVElement;
  sectionCount?: number;
  blockCount?: number;
  readonly?: boolean;
}) => {
  const {
    updateElement,
    selectElement,
    selectedElementId,
    selectedHeaderId,
    selectedSectionId,
    selectedBlockId,
    removeSection,
    removeBlock,
    removeHeader,
    showSectionDividers,
    pageProperties,
  } = useCV();
  const headerRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id || selectedHeaderId === element.id;

  // ---------- SECTION ----------
  if (element.type === "section") {
    const headerChild = element.children?.find((c) => c.type === "header");
    const blockChildren = element.children?.filter((c) => c.type === "block") ?? [];

    const borderStyle =
      showSectionDividers ?
        {
          borderBottom: `2px ${pageProperties.dividerStyle ?? "solid"} ${pageProperties.dividerColor ?? "#e4e4e7"}`,
        }
      : {
          borderBottom: "none",
        };

    return (
      <div
        className={`relative flex flex-col w-full last:!border-b-0 ${selectedSectionId === element.id ? "ring-2 ring-primary" : ""}`}
        style={{
          height: sectionCount ? `${100 / sectionCount}%` : "auto",
          ...borderStyle,
        }}>
        {!readonly && selectedSectionId === element.id && (sectionCount ?? 0) > 1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(element.id);
                  }}
                  className="absolute top-1 left-1 z-20 bg-secondary text-primary p-1 rounded shadow flex items-center gap-1">
                  <Trash className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete section</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {headerChild && <CVElementRenderer key={headerChild.id} element={headerChild} readonly={readonly} />}
        <div className="flex w-full h-full">
          {blockChildren.map((child, idx) => {
            const fallback = 100 / blockChildren.length;
            const widths = blockChildren.map((b) => (typeof b.width === "number" && b.width > 0 ? b.width : fallback));
            const total = widths.reduce((s, w) => s + w, 0);
            const pct = total > 0 ? (widths[idx] / total) * 100 : fallback;

            return (
              <div
                key={child.id}
                className={selectedSectionId === element.id && idx > 0 ? "border-l border-zinc-200" : ""}
                style={{ width: `${pct}%` }}>
                <CVElementRenderer
                  element={child}
                  sectionCount={sectionCount}
                  blockCount={blockChildren.length}
                  readonly={readonly}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- HEADER ----------
  if (element.type === "header") {
    const headerStyle = element.properties?.headerStyle;

    return (
      <div
        className="w-full px-4 py-3 flex-shrink-0"
        style={{
          backgroundColor: headerStyle?.backgroundColor ?? "transparent",
        }}>
        <div
          style={{
            textAlign: headerStyle?.textAlign ?? "start",
          }}
          className="relative">
          {!readonly && isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeHeader(element.id);
              }}
              className="absolute top-[5px] right-0 bg-secondary text-secondary-foreground p-1 rounded shadow">
              <Trash className="h-3 w-3" />
            </button>
          )}

          <div
            style={{
              display: headerStyle?.underline?.width === "fullWidth" ? "block" : "inline-block",
              maxWidth: "100%",
            }}>
            <div
              ref={headerRef}
              contentEditable={!readonly}
              suppressContentEditableWarning
              data-placeholder="Section Header"
              onClick={() => {
                if (!readonly) {
                  selectElement(element.id);
                }
              }}
              onBlur={() => {
                updateElement(element.id, {
                  properties: {
                    ...element.properties,
                    headerStyle: {
                      ...headerStyle,
                      content: headerRef.current?.innerText ?? headerStyle?.content,
                    },
                  },
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.execCommand("insertLineBreak");
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
              }}
              className={`
            cursor-text outline-none whitespace-pre-wrap px-1 transition rounded-sm
            empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground
            ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}
          `}
              style={{
                color: headerStyle?.color ?? "inherit",
                fontSize: headerStyle?.fontSize ? `${headerStyle.fontSize}px` : undefined,
                outline: "none",
                whiteSpace: "pre-wrap",
                cursor: readonly ? "default" : "text",
              }}>
              {headerStyle?.content || ""}
            </div>

            {headerStyle?.underline?.enabled && (
              <div
                className="h-[2px] bg-current"
                style={{
                  marginTop: `${headerStyle.underline.gap ?? 4}px`,
                  width: "100%",
                  color: headerStyle?.color ?? "inherit",
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- BLOCK ----------
  if (element.type === "block") {
    return (
      <div className={`relative h-full p-4 ${selectedBlockId === element.id ? "bg-zinc-50" : ""}`}>
        {!readonly && selectedBlockId === element.id && (blockCount ?? 0) > 1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(element.id);
                  }}
                  className="absolute top-1 right-1 z-20 bg-secondary text-primary p-1 rounded shadow flex items-center gap-1">
                  <Trash className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {element.children?.map((child) => (
          <CVElementRenderer key={child.id} element={child} readonly={readonly} />
        ))}
      </div>
    );
  }

  // ---------- CONTENT ----------
  switch (element.type) {
    case "text":
      return <CvTextRenderer element={element} readonly={readonly} />;
    case "list":
      return <CvListRenderer element={element} readonly={readonly} />;
    case "date":
      return <CvDateRenderer element={element} readonly={readonly} />;
    case "token":
      return <CvTokenRenderer element={element} readonly={readonly} />;
    case "image":
      return <CvImageRenderer element={element} readonly={readonly} />;
    case "icon":
      return <CvIconRenderer element={element} readonly={readonly} />;
    case "location":
      return <CvLocationRenderer element={element} readonly={readonly} />;
    default:
      return <div>{element.content}</div>;
  }
};

export default CVElementRenderer;
