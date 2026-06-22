import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddressSuggestion, fetchAddressSuggestions } from "@/shared/services/cvbuilder";
import { Loader2, MapPin, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ControllerRenderProps, FieldValue, UseFormReturn } from "react-hook-form";

type LocationSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "location";
  validation?: {
    required?: boolean;
  };
};

function formatSuggestion(suggestion: AddressSuggestion) {
  return (
    suggestion.formatted ||
    [suggestion.address_line1, suggestion.address_line2, suggestion.city, suggestion.state, suggestion.country]
      .filter(Boolean)
      .join(", ")
  );
}

function LocationInput({
  field,
  schema,
  disabled,
}: {
  field: ControllerRenderProps<any, string>;
  schema: LocationSchema;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(field.value ?? "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    setQuery(field.value ?? "");
  }, [field.value]);

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
    field.onChange(value);
  }

  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...field}
        value={query}
        disabled={disabled}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          field.onChange(value);
        }}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          field.onBlur();
        }}
        placeholder={schema.placeholder}
        className="pl-9 pr-9"
      />
      {isSearching && (
        <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Searching locations" />
        </span>
      )}
      {query && isFocused && !disabled && !isSearching && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            commitValue("");
            setSuggestions([]);
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && isFocused && !disabled && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {isSearching && <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>}
          {!isSearching &&
            suggestions.map((suggestion, index) => {
              const label = formatSuggestion(suggestion);

              return (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
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

function location({
  form,
  schema,
  disabled,
}: {
  form: UseFormReturn<any> | FieldValue<any>;
  schema: LocationSchema;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }: { field: ControllerRenderProps<any, string>}) => (
        <FormItem className="relative">
          <FormLabel>
            {schema.label} {schema.validation?.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <LocationInput field={field} schema={schema} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default location;
