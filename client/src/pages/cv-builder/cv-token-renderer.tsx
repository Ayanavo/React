import { CVElement, useCV } from "@/lib/useCV";
import { ArrowRight, Dot, Minus, Plus, Slash, Trash, X } from "lucide-react";
import React, { CSSProperties, ReactNode } from "react";
import TokenInput from "./token-input";
import { fontWeightMap } from "@/lib/utils";

const CvTokenRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { updateElement, selectedElementId, selectElement, removeElement } = useCV();

  const isSelected = selectedElementId === element.id;
  const INTERLINK_ICON_MAP: Record<string, ReactNode> = {
    dot: <Dot className="w-3 h-3" />,
    slash: <Slash className="w-3 h-3" />,
    pipe: <Minus className="w-3 h-3 rotate-90" strokeWidth={2} />,
    arrow: <ArrowRight className="w-3 h-3" />,
    plus: <Plus className="w-3 h-3" />,
  };

  const interlink = element.properties?.tokenInterlink;
  const interlinkEnabled = interlink?.enabled;
  const interlinkIconKey = interlink?.icon ?? "dot";
  const InterlinkIcon = INTERLINK_ICON_MAP[interlinkIconKey];
  const tokens: string[] = Array.isArray(element.content) ? element.content : [""];

  const tokenStyle = element.properties?.tokenStyle ?? {};

  const baseStyle: CSSProperties = {
    color: element.properties?.color,
  };

  const chipStyle: CSSProperties = {
    backgroundColor: tokenStyle.backgroundColor ?? "transparent",
    borderColor: tokenStyle.borderColor ?? "currentColor",
    borderRadius: tokenStyle.radius ?? 6,
  };

  const flexStyle: CSSProperties = {
    justifyContent:
      element.properties?.textAlign === "center" ? "center"
      : element.properties?.textAlign === "end" ? "flex-end"
      : element.properties?.textAlign === "start" ? "flex-start"
      : "flex-start",
  };

  const updateToken = (index: number, value: string) => {
    const next = [...tokens];
    next[index] = value;
    updateElement(element.id, { content: next });
  };

  const addToken = () => {
    updateElement(element.id, {
      content: [...tokens, ""],
    });
  };

  const removeToken = (index: number) => {
    if (tokens.length === 1) return;
    const next = tokens.filter((_, i) => i !== index);
    updateElement(element.id, { content: next });
  };

  return (
    <div
      className={`relative rounded-sm px-1 transition
        ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`}
      style={baseStyle}
      onClick={
        !readonly ?
          (e) => {
            e.stopPropagation();
            selectElement(element.id);
          }
        : undefined
      }>
      {/* delete element */}
      {!readonly && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow">
          <Trash className="h-3 w-3" />
        </button>
      )}

      <div className="flex flex-wrap items-center gap-1" style={flexStyle}>
        {tokens.map((value, index) => (
          <React.Fragment key={index}>
            {/* TOKEN CHIP */}
            <div className="relative flex items-center gap-1 px-[4px] py-[2px] border max-w-full" style={chipStyle}>
              {readonly ?
                <span
                  className="whitespace-pre-wrap break-words min-w-0"
                  style={{
                    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
                    textDecoration:
                      [
                        element.properties?.fontStyle?.underline ? "underline" : "",
                        element.properties?.fontStyle?.strikethrough ? "line-through" : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || "none",
                  }}>
                  {value || "—"}
                </span>
              : <TokenInput
                  value={value}
                  onChange={(v) => updateToken(index, v)}
                  fontSize={element.properties?.fontSize}
                  fontWeight={element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined}
                  fontStyle={element.properties?.fontStyle}
                />
              }

              {!readonly && isSelected && tokens.length > 1 && (
                <button onClick={() => removeToken(index)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* INTERLINK BETWEEN CHIPS */}
            {interlinkEnabled && index < tokens.length - 1 && (
              <span className="mx-1 text-muted-foreground select-none flex items-center">{InterlinkIcon}</span>
            )}
          </React.Fragment>
        ))}

        {/* ADD TOKEN */}
        {!readonly && isSelected && (
          <button
            onClick={addToken}
            className="w-6 h-6 flex items-center justify-center border rounded text-muted-foreground hover:bg-muted"
            title="Add token">
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CvTokenRenderer;
