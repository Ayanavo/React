import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressSuggestion, fetchAddressSuggestions } from "@/shared/services/cvbuilder";
import { Loader2, MapPin, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ActivityFormValues } from "./activity.types";

function formatSuggestion(suggestion: AddressSuggestion) {
  return (
    suggestion.formatted ||
    [suggestion.address_line1, suggestion.address_line2, suggestion.city, suggestion.state, suggestion.country]
      .filter(Boolean)
      .join(", ")
  );
}

export default function LocationAutocompleteField({
  form,
  disabled,
}: {
  form: UseFormReturn<ActivityFormValues>;
  disabled?: boolean;
}) {
  const location = form.watch("location") ?? "";
  const [query, setQuery] = useState(location);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    setQuery(location);
  }, [location]);

  useEffect(() => {
    if (disabled || query.trim().length < 3) {
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
  }, [disabled, query]);

  function commitValue(value: string) {
    setQuery(value);
    form.setValue("location", value, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="relative space-y-2">
      <Label htmlFor="activity-location">Location</Label>
      <div className="relative flex items-center gap-2 rounded-md border bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          id="activity-location"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            form.setValue("location", value, { shouldDirty: true, shouldValidate: true });
          }}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search location..."
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        {isSearching ?
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-label="Searching locations" />
        : null}
        {query && isFocused && !disabled && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              commitValue("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && isFocused && !disabled && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border bg-background shadow-lg">
          {isSearching && <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>}
          {!isSearching &&
            suggestions.map((suggestion, index) => {
              const label = formatSuggestion(suggestion);

              return (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    commitValue(label);
                    setIsOpen(false);
                  }}>
                  {label}
                </button>
              );
            })}
          {!isSearching && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
}
