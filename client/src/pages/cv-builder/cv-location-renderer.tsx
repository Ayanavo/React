import { CVElement, useCV } from "@/lib/useCV";
import React, { useRef } from "react";

const CvLocationRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { selectedElementId } = useCV();
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id;

  return (
    <div ref={ref} className={isSelected ? "border-2 border-blue-500" : ""}>
      <input type="text" value={"Kolkata, 700042, India"} readOnly={readonly} />
    </div>
  );
};
export default CvLocationRenderer;
