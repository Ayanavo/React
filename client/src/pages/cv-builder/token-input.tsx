import React, { useLayoutEffect, useRef } from "react";

const TokenInput = ({ value, onChange, readonly, }: { value: string; readonly?: boolean; onChange?: (v: string) => void }) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (spanRef.current && inputRef.current) {
            inputRef.current.style.width = spanRef.current.offsetWidth + 2 + "px";
        }
    }, [value]);

    return (
        <>
            {/* invisible measuring span */}
            <span ref={spanRef} className="absolute invisible whitespace-pre text-sm px-0">{value || "•"}</span>
            {readonly ? (<span className="whitespace-pre">{value || "—"}</span>) : (
                <input ref={inputRef} value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className=" bg-transparent outline-none text-sm leading-none px-0 py-0"
                />
            )}
        </>
    );
};

export default TokenInput;