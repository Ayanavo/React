import { type CVElement } from "@/lib/useCV";
import React from "react";
import CvListRenderer from "./cv-list-renderer";
import CvTextRenderer from "./cv-text-renderer";

const CVElementRenderer = ({ element, sectionCount }: { element: CVElement; sectionCount?: number }) => {
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
    case "text":
      return <CvTextRenderer element={element} />;
    case "list":
      return <CvListRenderer element={element} />;
    default:
      return <div>{element.content}</div>;
  }
};

export default CVElementRenderer;
