import { CVElement, useCV } from "@/lib/useCV";
import React, { CSSProperties, useRef } from "react";
import { ListIcon } from "./list-icons";

const CvListRenderer = ({ element }: { element: CVElement }) => {
  const { updateElement, selectedElementId, selectElement } = useCV();
  const isSelected = selectedElementId === element.id;
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Normalize content to string[] - flatten string[][] if needed
  const items: string[] =
    Array.isArray(element.content) ?
      Array.isArray(element.content[0]) ?
        (element.content as string[][]).flat()
      : (element.content as string[])
    : [""];
  const ref = useRef<HTMLDivElement>(null);
  const columns = Array.isArray(element.content?.[0]) ? (element.content as string[][]) : [element.content as string[]];

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    textDecoration: [element.properties?.fontStyle?.underline && "underline", element.properties?.fontStyle?.strikethrough && "line-through"].filter(Boolean).join(" "),
    color: element.properties?.color,
  };

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    updateElement(element.id, { content: next });
  };

  const insertItem = (index: number) => {
    const next = [...items];
    next.splice(index + 1, 0, "");
    updateElement(element.id, { content: next });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    document.execCommand("insertLineBreak");
    const text = e.currentTarget.textContent ?? "";
    updateItem(index, text);
    insertItem(index);

    // ✅ restore caret AFTER render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const next = itemRefs.current[index + 1];
        if (!next) return;

        next.focus();

        const range = document.createRange();
        range.selectNodeContents(next);
        range.collapse(true);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    });
  };

  const extractLines = (): string[] => {
    if (!ref.current) return [];
    return Array.from(ref.current.querySelectorAll("[data-list-item]"))
      .map((el) => el.textContent?.trim() ?? "")
      .filter(Boolean);
  };

  const handleBlur = () => {
    if (!ref.current) return;
    const lines = extractLines();
    if (!lines.length) return;
    const isOverflowing = ref.current.scrollHeight > ref.current.clientHeight + 2;
    if (!isOverflowing) {
      updateElement(element.id, {
        content: lines,
        properties: { ...element.properties, columns: 1 },
      });
      return;
    }
    splitIntoColumns(lines);
  };

  const splitIntoColumns = (items: string[]) => {
    if (!ref.current) return;
    const maxHeight = ref.current.clientHeight;
    const temp: string[][] = [[]];
    let currentHeight = 0;
    items.forEach((item) => {
      const approxLineHeight = parseInt(getComputedStyle(ref.current!).fontSize) * 1.4;

      if (currentHeight + approxLineHeight > maxHeight) {
        temp.push([item]);
        currentHeight = approxLineHeight;
      } else {
        temp[temp.length - 1].push(item);
        currentHeight += approxLineHeight;
      }
    });

    updateElement(element.id, {
      content: temp,
      properties: {
        ...element.properties,
        columns: temp.length,
      },
    });
  };

  return (
    <div ref={ref} onBlurCapture={handleBlur} className="relative max-h-[300px] overflow-hidden">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 space-y-1">
          {col.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <ListIcon element={element} />
              <span
                ref={(el) => (itemRefs.current[i] = el)}
                id={`${element.id}-item-${i}`}
                data-list-item
                contentEditable={colIndex === 0}
                onKeyDown={(e) => handleKeyDown(e, i)}
                suppressContentEditableWarning
                className="outline-none min-w-[2px]">
                {item}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CvListRenderer;
