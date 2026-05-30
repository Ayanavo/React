import { Input } from "@/components/ui/input";
import { CVElement, useCV } from "@/lib/useCV";
import { fontWeightMap } from "@/lib/utils";
import { AddressSuggestion, fetchAddressSuggestions } from "@/shared/services/cvbuilder";
import { MapPin, Trash } from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";

const CvLocationRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean }) => {
  const { updateElement, selectedElementId, removeElement, selectElement } = useCV();
  const [query, setQuery] = useState(String(element.content ?? ""));
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRequestRef = useRef(0);
  const isSelected = selectedElementId === element.id;

  useEffect(() => {
    setQuery(String(element.content ?? ""));
  }, [element.content]);

  useEffect(() => {
    if (readonly || !isSelected || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
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

  if (readonly) {
    return (
      <div className="flex items-center gap-2 px-1" style={{ justifyContent: element.properties?.textAlign }}>
        <MapPin className="h-4 w-4 shrink-0" />
        <span style={style}>{String(element.content ?? "")}</span>
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

      <div
        className={`flex items-center gap-2 rounded-sm px-1 py-1 transition ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`}
        style={{ justifyContent: element.properties?.textAlign }}>
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            updateElement(element.id, { content: value });
          }}
          onFocus={() => {
            selectElement(element.id);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search location..."
          style={style}
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {isSelected && isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border bg-background shadow-lg">
          {isSearching && <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>}
          {!isSearching &&
            suggestions.map((suggestion, index) => {
              const label = suggestion.formatted || [suggestion.address_line1, suggestion.address_line2, suggestion.city, suggestion.state, suggestion.country].filter(Boolean).join(", ");

              return (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs hover:bg-muted"
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
          {!isSearching && suggestions.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No locations found</div>}
        </div>
      )}
    </div>
  );
};

export default CvLocationRenderer;
