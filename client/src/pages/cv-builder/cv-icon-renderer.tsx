import Icon from "@/common/icons";
import { CVElement, useCV } from "@/lib/useCV";
import { fontWeightMap } from "@/lib/utils";
import { Trash } from "lucide-react";
import React, { CSSProperties } from "react";

const CvIconRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { selectedElementId, removeElement, selectElement } = useCV();
  const isSelected = selectedElementId === element.id;
  const iconName = element.properties?.icon ?? "star";

  const style: CSSProperties = {
    fontWeight: element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    color: element.properties?.color,
  };

  const flexStyle: CSSProperties = {
    justifyContent:
      element.properties?.textAlign === "center" ? "center"
      : element.properties?.textAlign === "end" ? "flex-end"
      : element.properties?.textAlign === "start" ? "flex-start"
      : "flex-start",
  };

  return (
    <div className="relative">
      {/* DELETE BUTTON */}
      {!readonly && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground p-1 rounded shadow z-10">
          <Trash className="h-3 w-3" />
        </button>
      )}
      <div
        style={flexStyle}
        className={`flex items-center text-secondary-foreground p-1 rounded bg-inherit gap-2 px-2 py-1  ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!readonly) selectElement(element.id);
        }}>
        <Icon icon={iconName} style={style} size={element.properties?.fontSize ? element.properties.fontSize : undefined} />
      </div>
    </div>
  );
};

export default CvIconRenderer;
