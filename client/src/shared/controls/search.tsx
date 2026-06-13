import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectWithSearchProps = {
  options: Option[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * SelectWithSearch
 * - Single-select combobox built with shadcn Popover + Command.
 * - Built-in search field with a lucide Search icon.
 * - Supports controlled (value/onChange) and uncontrolled usage.
 */
const search = ({
  options,
  value: controlledValue,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled,
}: SelectWithSearchProps) => {
  const [open, setOpen] = React.useState(false);
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(null);

  const value = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const selected = options.find((o) => o.value === value) || null;

  const handleSelect = (next: string) => {
    const nextValue = next === value ? null : next;
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls="select-with-search-listbox"
          aria-haspopup="listbox"
          className={cn("w-full justify-between", className)}
          disabled={disabled}>
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-(--radix-popover-trigger-width) min-w-56" align="start">
        <Command loop>
          {/* Header with Search icon and input */}
          <div className="flex items-center border-b px-3">
            <CommandInput placeholder={searchPlaceholder} className="h-10" aria-label="Search options" />
          </div>

          <CommandList id="select-with-search-listbox" role="listbox">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    keywords={[opt.value]}
                    onSelect={() => !opt.disabled && handleSelect(opt.value)}
                    className={cn(opt.disabled && "opacity-50 pointer-events-none")}
                    aria-selected={isSelected}
                    role="option">
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default search;
