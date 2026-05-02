import { CVElement, useCV } from "@/lib/useCV";
import React, { CSSProperties, useRef } from "react";
import { ListIcon } from "./list-icons";
import { Trash } from "lucide-react";

const CvListRenderer = ({
  element,
  readonly = false,
}: {
  element: CVElement;
  readonly?: boolean;
}) => {
  const { updateElement, selectedElementId, removeElement, selectElement } = useCV();

  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isInternalFocusRef = useRef(false);
  const isEditingRef = useRef(false);
  const isSelected = selectedElementId === element.id;

  // ---------- Normalize content ----------
  const items: string[] =
    Array.isArray(element.content)
      ? (element.content as string[]) : [""];

  // ---------- Styles (same contract as text) ----------
  const decorations: string[] = [];
  if (element.properties?.fontStyle?.underline) decorations.push("underline");
  if (element.properties?.fontStyle?.strikethrough) decorations.push("line-through");

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize
      ? `${element.properties.fontSize}px`
      : undefined,
    fontWeight: element.properties?.fontWeight,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    color: element.properties?.color,
    ...(isEditingRef.current
      ? {}
      : {
        columnWidth: "260px",
        columnGap: "1.5rem",
      }),
  };


  // ---------- Caret helpers ----------
  const placeCaretAtStart = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const focusItemAtIndex = (targetIndex: number) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = itemRefs.current[targetIndex];
        if (!el) return;
        el.focus();
        placeCaretAtEnd(el);
      });
    });
  };


  // ---------- State updates ----------
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

  // ---------- Keyboard handling ----------
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    index: number
  ) => {
    // Enter → new list item
    if (e.key === "Enter") {
      e.preventDefault();

      const text = e.currentTarget.innerText;
      updateItem(index, text);
      insertItem(index);

      isInternalFocusRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const next = itemRefs.current[index + 1];
          if (!next) return;
          next.focus();
          placeCaretAtStart(next);
          isInternalFocusRef.current = false;
        });
      });
      return;
    }

    // Arrow up
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = itemRefs.current[index - 1];
      if (prev) {
        prev.focus();
        placeCaretAtStart(prev);
      }
      return;
    }

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = itemRefs.current[index + 1];
      if (next) {
        next.focus();
        placeCaretAtStart(next);
      }
    }

    // Backspace → merge with previous item
    // Backspace → merge with previous item (repeatable)
    if (e.key === "Backspace") {
      const currentText = e.currentTarget.innerText;

      // Only act when item is empty
      if (currentText === "") {
        if (items.length <= 1) return;


        e.preventDefault();
        const targetIndex = index - 1;

        // Build new items array
        const next = [...items];
        next.splice(index, 1);
        itemRefs.current.splice(index, 1);
        updateElement(element.id, { content: next });
        isInternalFocusRef.current = true;
        focusItemAtIndex(targetIndex);
        isInternalFocusRef.current = false;

        return;
      }
    }

  };

  // ---------- Paste (plain text only) ----------
  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // ---------- Blur → save ----------
  const handleBlur = () => {
    if (isInternalFocusRef.current) return;
    isEditingRef.current = false;
    if (!ref.current) return;

    const lines = Array.from(
      ref.current.querySelectorAll("[data-list-item]")
    ).map((el) => el.textContent ?? "");

    updateElement(element.id, { content: lines });
  };

  // ----------BackSpace bullet delete --------
  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };



  // ---------- Render ----------
  return (
    <div
      ref={ref}
      style={style}
      onClick={
        !readonly
          ? (e) => {
            e.stopPropagation();
            selectElement(element.id);
          }
          : undefined
      }
      onBlurCapture={!readonly ? handleBlur : undefined}
      className={`
        relative max-h-[300px] overflow-hidden rounded-sm px-1 transition
        ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}
      `}
    >
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

      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 items-center break-inside-avoid-column"
        >
          <ListIcon element={element} index={index} />
          {readonly ? (
            <span className="whitespace-pre-wrap">{item}</span>
          ) : (
            <span
              ref={(el) => (itemRefs.current[index] = el)}
              data-list-item
              data-placeholder="Type here..."
              contentEditable
              suppressContentEditableWarning
              onFocus={() => {
                isEditingRef.current = true;
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="
                cursor-text outline-none min-w-[2px]
                empty:before:content-[attr(data-placeholder)]
                empty:before:text-muted-foreground
              "
            >
              {item}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CvListRenderer;
