import Icon from "@/common/icons";
import { CVElement, useCV } from "@/lib/useCV";
import { fontWeightMap } from "@/lib/utils";
import React, { CSSProperties } from "react";

const CvIconRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { selectedElementId, selectElement } = useCV();
  const isSelected = selectedElementId === element.id;
  const iconName = element.properties?.icon ?? "star";

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    textAlign: element.properties?.textAlign,
    color: element.properties?.color,
  };

  return (
    <div
      className={`inline-flex items-center bg-secondary text-secondary-foreground p-1 rounded shadow gap-2 px-2 py-1  ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!readonly) selectElement(element.id);
      }}>
      <Icon icon={iconName} customClass="w-5 h-5" style={style} />
    </div>
  );
};

export default CvIconRenderer;
