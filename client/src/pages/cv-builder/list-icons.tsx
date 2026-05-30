import Icon from "@/common/icons";
import { ArrowRight, Check, Minus } from "lucide-react";
import React from "react";

export function ListIcon({ element, index }: { element: any; index: number }) {
  const iconName = typeof element === "string" ? element : (element.properties?.listStyle?.icon ?? "bullet");
  const style = {
    color: element.properties?.listStyle?.iconColor ?? "currentColor",
    fill: element.properties?.listStyle?.iconFill === "fill" ? "currentColor" : "none",
    fontWeight: 500,
  };

  switch (iconName) {
    case "number":
      return <span style={style}>{index + 1}.</span>;
    case "check":
      return <Check size={14} style={style} />;
    case "dash":
      return <Minus size={14} style={style} />;
    case "arrow":
      return <ArrowRight size={14} style={style} />;
    case "bullet":
      return <span style={style}>{"\u2022"}</span>;
    default:
      return <Icon icon={iconName} customClass="shrink-0" size={14} style={style} />;
  }
}
