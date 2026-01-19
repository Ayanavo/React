import { useCV, type CVElement } from "@/lib/useCV";
import React, { CSSProperties, useState } from "react";

const CVElementRenderer = ({ element, sectionCount }: { element: CVElement; sectionCount?: number }) => {
  const { updateElement, selectElement, selectedElementId } = useCV();
  const isSelected = selectedElementId === element.id;

  const ref = React.useRef<HTMLParagraphElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight,
    fontStyle: element.properties?.fontStyle,
  };

  // ---------- SECTION ----------
  if (element.type === "section") {
    return (
      <div
        className="flex w-full border-b last:border-b-0"
        style={{
          height: sectionCount ? `${100 / sectionCount}%` : "auto",
        }}>
        {/* Blocks inside section */}
        <div className="flex w-full h-full">{element.children?.map((child) => <CVElementRenderer key={child.id} element={child} sectionCount={sectionCount} />)}</div>
      </div>
    );
  }

  // ---------- BLOCK ----------
  if (element.type === "block") {
    return <div className="flex-1 h-full p-4">{element.children?.map((child) => <CVElementRenderer key={child.id} element={child} />)}</div>;
  }
  console.log(element);
  // ---------- CONTENT ----------
  switch (element.type) {


    case "text":
      return  <p
      ref={ref}
      style={style}
      contentEditable={element.editable}
      suppressContentEditableWarning

      onClick={(e) => {
        e.stopPropagation();
        selectElement(element.id);   // 🔥 THIS IS THE FIX
      }}

      onFocus={() => setIsEditing(true)}

      onBlur={() => {
        setIsEditing(false);
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

        ${
          isSelected
            ? "ring-2 ring-primary bg-primary/5"
            : "ring-1 ring-transparent hover:ring-muted"
        }
      `}
    >
      {element.content}
    </p>;
    default:
      return <div style={style}>{element.content}</div>;
  }
};

export default CVElementRenderer;
