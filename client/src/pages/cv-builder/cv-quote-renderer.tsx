import { CVElement, useCV } from "@/lib/useCV";
import { fontWeightMap } from "@/lib/utils";
import { Trash } from "lucide-react";
import React, { CSSProperties, useRef } from "react";

const CvQuoteRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { updateElement, selectedElementId, removeElement, selectElement } = useCV();
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id;

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined,
    fontStyle: "italic",
    color: element.properties?.color,
    paddingLeft: element.properties?.textIndent ? `${element.properties.textIndent}px` : "1rem",
    borderLeft: "3px solid hsl(var(--primary) / 0.5)",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    marginTop: "0.25rem",
    marginBottom: "0.25rem",
  };

  return (
    <div className="relative">
      {!readonly && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow">
          <Trash className="h-3 w-3" />
        </button>
      )}

      <div
        ref={ref}
        style={style}
        contentEditable={!readonly && element.editable !== false}
        suppressContentEditableWarning
        onClick={
          !readonly ?
            (e) => {
              e.stopPropagation();
              selectElement(element.id);
            }
          : undefined
        }
        onBlur={() => {
          updateElement(element.id, {
            content: ref.current?.innerText ?? "",
          });
        }}
        data-placeholder="Add a quote..."
        className={`
          cursor-text outline-none whitespace-pre-wrap break-words rounded-sm px-3
          empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground
          ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}
        `}>
        {element.content}
      </div>
    </div>
  );
};

export default CvQuoteRenderer;
