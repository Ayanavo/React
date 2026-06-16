import { Input } from "@/components/ui/input";
import { CVElement, useCV } from "@/lib/useCV";
import { cn, fontWeightMap } from "@/lib/utils";
import { AddressSuggestion, fetchAddressSuggestions } from "@/shared/services/cvbuilder";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { MapPin, Trash, Loader2, X } from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useCvCanvasOverlay } from "./cv-canvas-overlay";

const CvLocationRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { updateElement, selectedElementId, removeElement, selectElement, setLocationDropdownElementId } = useCV();
  const overlayEl = useCvCanvasOverlay();
  const [query, setQuery] = useState(String(element.content ?? ""));
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRequestRef = useRef(0);
  const isSelected = selectedElementId === element.id;
  const popoverOpen = isSelected && isOpen;

  useEffect(() => {
    setQuery(String(element.content ?? ""));
  }, [element.content]);

  useEffect(() => {
    if (popoverOpen) {
      setLocationDropdownElementId(element.id);
      return () => setLocationDropdownElementId(null);
    }
    setLocationDropdownElementId(null);
  }, [element.id, popoverOpen, setLocationDropdownElementId]);

  useEffect(() => {
    if (readonly || !isSelected || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await fetchAddressSuggestions(query.trim());
        if (searchRequestRef.current !== requestId) return;
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
        if (searchRequestRef.current !== requestId) return;
        setSuggestions([]);
        setIsOpen(false);
        console.error("Address suggestions failed", error);
      } finally {
        if (searchRequestRef.current === requestId) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isSelected, query, readonly]);

  const decorations: string[] = [];
  if (element.properties?.fontStyle?.underline) decorations.push("underline");
  if (element.properties?.fontStyle?.strikethrough) decorations.push("line-through");

  const style: CSSProperties = {
    fontSize: element.properties?.fontSize ? `${element.properties.fontSize}px` : undefined,
    fontWeight: element.properties?.fontWeight ? fontWeightMap[element.properties.fontWeight] : undefined,
    fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: element.properties?.textAlign,
    color: element.properties?.color,
  };

  const justifyContent =
    element.properties?.textAlign === "center" ? "center"
    : element.properties?.textAlign === "end" ? "flex-end"
    : "flex-start";

  const flexDir = element.properties?.textAlign === "end" ? "row-reverse" : "row";

  const iconSize = element.properties?.fontSize ? `${element.properties.fontSize}px` : "16px";
  const iconStyle: CSSProperties = {
    color: element.properties?.color,
    width: iconSize,
    height: iconSize,
  };

  if (readonly) {
    return (
      <div
        className="flex items-start gap-2 px-1"
        style={{
          justifyContent,
          flexDirection: flexDir,
        }}>
        <span className="shrink-0 flex items-center justify-center select-none" style={{ height: "1.5em" }}>
          <MapPin style={iconStyle} />
        </span>
        <span style={style} className="whitespace-pre-wrap break-words min-w-0 max-w-full">
          {String(element.content ?? "")}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onClick={(e) => {
        e.stopPropagation();
        selectElement(element.id);
      }}>
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          className="absolute top-2 right-2 z-20 bg-secondary text-secondary-foreground p-1 rounded shadow">
          <Trash className="h-3 w-3" />
        </button>
      )}

      <PopoverPrimitive.Root open={popoverOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverPrimitive.Anchor asChild>
          <div
            className={`flex items-start gap-2 rounded-sm px-1 py-1 transition ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`}
            style={{
              justifyContent,
              flexDirection: flexDir,
            }}>
            <span className="shrink-0 flex items-center justify-center select-none" style={{ height: "2rem" }}>
              <MapPin style={iconStyle} />
            </span>
            <Input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                updateElement(element.id, { content: value });
              }}
              onFocus={() => {
                setIsFocused(true);
                selectElement(element.id);
                if (suggestions.length > 0) setIsOpen(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              placeholder="Search location..."
              style={style}
              className="h-8 w-auto max-w-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            {isSearching ?
              <span className="shrink-0 flex items-center justify-center select-none" style={{ height: "2rem" }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Searching locations" />
              </span>
            : null}
            {query && isFocused && (
              <span className="shrink-0 flex items-center justify-center select-none" style={{ height: "2rem" }}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery("");
                    updateElement(element.id, { content: "" });
                    setSuggestions([]);
                    setIsOpen(false);
                    selectElement(element.id);
                  }}
                  className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-muted shrink-0 z-10">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        </PopoverPrimitive.Anchor>

        {overlayEl && (
          <PopoverPrimitive.Portal container={overlayEl}>
            <PopoverPrimitive.Content
              align="start"
              side="bottom"
              sideOffset={4}
              collisionPadding={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              className={cn(
                "pointer-events-auto z-[9999] max-h-56 w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-md outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              )}>
              {isSearching && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching...
                </div>
              )}
              {!isSearching &&
                suggestions.map((suggestion, index) => {
                  const label =
                    suggestion.formatted ||
                    [
                      suggestion.address_line1,
                      suggestion.address_line2,
                      suggestion.city,
                      suggestion.state,
                      suggestion.country,
                    ]
                      .filter(Boolean)
                      .join(", ");

                  return (
                    <button
                      key={`${label}-${index}`}
                      type="button"
                      className={cn(
                        "w-full border-b border-border/60 px-3 py-2 text-left text-xs text-popover-foreground transition-colors last:border-b-0",
                        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery(label);
                        setIsOpen(false);
                        updateElement(element.id, { content: label });
                      }}>
                      {label}
                    </button>
                  );
                })}
              {!isSearching && suggestions.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No locations found</div>
              )}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        )}
      </PopoverPrimitive.Root>
    </div>
  );
};

export default CvLocationRenderer;
