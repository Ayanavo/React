import { ArrowRight, Check, Minus } from "lucide-react";
import React from "react";

export function ListIcon({ element, index}: { element: any; index: number}) {
  const style = {
    color: element.properties?.listStyle?.iconColor ?? "currentColor",
    fontWeight: 500,
  };

  switch (element.properties?.listStyle?.icon || element) {
    case "number":
      return <span style={style}>{index + 1}.</span>;
    case "check":
      return <Check size={14} style={style} />;
    case "dash":
      return <Minus size={14} style={style} />;
    case "arrow":
      return <ArrowRight size={14} style={style} />;
    case "bullet":
    default:
      return <span style={style}>•</span>;
  }
}
