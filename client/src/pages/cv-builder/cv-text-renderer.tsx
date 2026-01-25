import { CVElement, fontWeight, useCV } from "@/lib/useCV";
import { Trash } from "lucide-react";
import React, { CSSProperties, useRef } from "react";

const CvTextRenderer = ({ element, readonly = false }: { element: CVElement, readonly?: boolean }) => {
  const { updateElement, selectedElementId, removeElement, selectElement } = useCV();
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id;
  const fontWeightMap: Record<fontWeight, number> = {
    light: 300,
    normal: 400,
    medium: 500,
    "semi-bold": 600,
    bold: 700,
  };
  const decorations: string[] = [];

  if (element.properties?.fontStyle?.underline) {
    decorations.push("underline");
  }

  if (element.properties?.fontStyle?.strikethrough) {
    decorations.push("line-through");
  }

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: element.properties?.textAlign,
    color: element.properties?.color,
  };

  return (
    <div className="relative">
      {!readonly && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow"
        >
          <Trash className="h-3 w-3" />
        </button>
      )}

      <p
        ref={ref}
        style={style}
        contentEditable={!readonly && element.editable !== false}
        suppressContentEditableWarning
        onClick={
          !readonly
            ? (e) => {
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
        data-placeholder="Type here..."
        className={`
      cursor-text outline-none
      empty:before:content-[attr(data-placeholder)]
      empty:before:text-muted-foreground
      rounded-sm px-1 transition
      ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}
    `}
      >
        {element.content}
      </p>
    </div>
  );
};

export default CvTextRenderer;
