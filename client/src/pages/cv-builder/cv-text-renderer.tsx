import Icon from "@/common/icons";
import { CVElement, useCV } from "@/lib/useCV";
import { fontWeightMap } from "@/lib/utils";
import { Trash } from "lucide-react";
import React, { CSSProperties, useRef } from "react";

const CvTextRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { updateElement, selectedElementId, removeElement, selectElement } = useCV();
  const ref = useRef<HTMLParagraphElement>(null);
  const isSelected = selectedElementId === element.id;
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
    textDecoration:
      element.properties?.fontStyle?.strikethrough ? "line-through"
      : element.properties?.fontStyle?.underline ? "underline"
      : "none",
    textAlign: element.properties?.textAlign,
    color: element.properties?.color,
    paddingLeft: element.properties?.textIndent ? `${element.properties.textIndent}px` : undefined,
  };
  const justifyContent =
    element.properties?.textAlign === "center" ? "center"
    : element.properties?.textAlign === "end" ? "flex-end"
    : "flex-start";
  const textAlign = element.properties?.textAlign ?? "start";
  const showIcon = element.properties?.showIcon && element.properties?.icon;
  const iconStyle: CSSProperties = {
    color: element.properties?.color,
    fill: element.properties?.iconFill === "fill" ? "currentColor" : "none",
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
        onClick={
          !readonly ?
            (e) => {
              e.stopPropagation();
              selectElement(element.id);
            }
          : undefined
        }
        className={`
          flex items-start gap-2 rounded-sm px-1 transition w-full min-w-0 items-center
          ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}
        `}
        style={{ justifyContent }}>
        {showIcon && (
          <span className="shrink-0 flex items-center justify-center select-none" style={{ height: "1.5em" }}>
            <Icon
              icon={element.properties?.icon ?? "Star"}
              customClass="shrink-0"
              style={iconStyle}
              size={element.properties?.fontSize ?? 14}
            />
          </span>
        )}
        <p
          ref={ref}
          style={{ ...style, textAlign }}
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
          className="
            cursor-text outline-none min-w-0 whitespace-pre-wrap break-words
            empty:before:content-[attr(data-placeholder)]
            empty:before:text-muted-foreground
          ">
          {element.content}
        </p>
      </div>
    </div>
  );
};

export default CvTextRenderer;
