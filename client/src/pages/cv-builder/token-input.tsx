import React, { useLayoutEffect, useRef } from "react";

const TokenInput = ({
  value,
  onChange,
  readonly,
  fontSize,
  fontWeight,
  fontStyle,
}: {
  value: string;
  readonly?: boolean;
  onChange?: (v: string) => void;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: { italic?: boolean; underline?: boolean; strikethrough?: boolean };
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const decorations: string[] = [];
  if (fontStyle?.underline) decorations.push("underline");
  if (fontStyle?.strikethrough) decorations.push("line-through");

  const inputStyle = {
    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
    ...(fontWeight ? { fontWeight } : {}),
    ...(fontStyle?.italic ? { fontStyle: "italic" } : { fontStyle: "normal" }),
    ...(decorations.length ? { textDecoration: decorations.join(" ") } : {}),
  };

  useLayoutEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width = Math.max(spanRef.current.offsetWidth + 6, 12) + "px";
    }
  }, [value, fontSize, fontWeight, fontStyle?.italic, fontStyle?.underline, fontStyle?.strikethrough]);

  return (
    <>
      {/* invisible measuring span */}
      <span
        ref={spanRef}
        className="absolute invisible whitespace-pre text-sm leading-none px-0 py-0"
        style={inputStyle}>
        {value || "—"}
      </span>
      {readonly ?
        <span className="whitespace-pre" style={inputStyle}>
          {value || "—"}
        </span>
      : <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className=" bg-transparent outline-none text-sm leading-none px-0 py-0 box-content"
          style={inputStyle}
        />
      }
    </>
  );
};

export default TokenInput;
