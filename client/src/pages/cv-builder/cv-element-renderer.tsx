import React from "react";
import type { CVElement } from "@/lib/useCV";

const CVElementRenderer = ({ element, sectionCount }: { element: CVElement; sectionCount?: number }) => {
  const style: React.CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight,
    fontStyle: element.properties?.fontStyle,
    marginTop: element.properties?.marginTop,
    marginBottom: element.properties?.marginBottom,
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

  // ---------- CONTENT ----------
  switch (element.type) {
    case "header":
      return <h1 style={style}>{element.content}</h1>;
    case "subheader":
      return <h2 style={style}>{element.content}</h2>;
    case "text":
      return <p style={style}>{element.content}</p>;
    default:
      return <div style={style}>{element.content}</div>;
  }
};

export default CVElementRenderer;
