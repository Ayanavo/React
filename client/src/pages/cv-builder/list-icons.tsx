import { ArrowRight, Check, Minus } from "lucide-react";
import React from "react";

export function ListIcon({ element }: { element: any }) {
  const style = {
    color: element.properties?.listStyle?.iconColor ?? "currentColor",
  };

  switch (element.properties?.listStyle?.type) {
    case "check":
      return <Check size={14} style={style} />;
    case "dash":
      return <Minus size={14} style={style} />;
    case "arrow":
      return <ArrowRight size={14} style={style} />;
    case "custom":
      return <span style={style}>{element.properties?.listStyle?.icon ?? "•"}</span>;
    default:
      return <span style={style}>•</span>;
  }
}
