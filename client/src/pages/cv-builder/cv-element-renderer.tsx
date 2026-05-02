import { type CVElement, useCV } from "@/lib/useCV";
import React, { useRef } from "react";
import { Trash } from "lucide-react";
import CvListRenderer from "./cv-list-renderer";
import CvTextRenderer from "./cv-text-renderer";
import CvDateRenderer from "./cv-date-renderer";
import CvTokenRenderer from "./cv-token-renderer";

const CVElementRenderer = ({ element, sectionCount, readonly = false }: { element: CVElement; sectionCount?: number; readonly?: boolean }) => {
  const { updateElement, selectElement, selectedElementId } = useCV();
  const headerRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id;

  // ---------- SECTION ----------
  if (element.type === "section") {
    const headerChild = element.children?.find((c) => c.type === "header");
    const blockChildren = element.children?.filter((c) => c.type === "block") ?? [];
    return (
      <div
        className="flex flex-col w-full border-b last:border-b-0"
        style={{
          height: sectionCount ? `${100 / sectionCount}%` : "auto",
        }}>
        {/* Blocks inside section */}
        <div className="flex w-full h-full">{element.children?.map((child) => <CVElementRenderer key={child.id} element={child} sectionCount={sectionCount} />)}</div>
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
              }}
              className="absolute top-0 right-0 bg-secondary text-secondary-foreground p-1 rounded shadow">
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
              onClick={(e) => {
                if (!readonly) {
                  e.stopPropagation();
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
    return <div className="flex-1 h-full p-4">{element.children?.map((child) => <CVElementRenderer key={child.id} element={child} />)}</div>;
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
    default:
      return <div>{element.content}</div>;
  }
};

export default CVElementRenderer;
