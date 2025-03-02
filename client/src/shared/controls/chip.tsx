import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import React, { useEffect } from "react";
import { FieldValue } from "react-hook-form";

type ChipSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "text";
  validation: { required: boolean };
};

export default function chip({ form, schema }: { form: FieldValue<any>; schema: ChipSchema }) {
  const [chips, setChips] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  useEffect(() => {
    form.setValue(schema.name, chips);
  }, [chips]);

  function removeChip(chip: string): void {
    const newChips = chips.filter((c) => c !== chip);
    setChips(newChips);
  }

  function addChip(value: string) {
    if (value && !chips.includes(value)) {
      const newChips = [...chips, value];
      setChips(newChips);
      setInputValue("");
    }
  }

  return (
    <FormField
      name={schema.name}
      render={() => (
        <FormItem>
          <FormLabel>{schema.label}</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Input
                  type="text"
                  placeholder={schema.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => {
                    if (inputValue.trim() !== "") {
                      addChip(inputValue);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChip(inputValue);
                    }
                  }}
                />
              </FormControl>
            </PopoverTrigger>
          </Popover>
          <FormMessage />

          {chips.map((chip) => (
            <Badge key={chip} variant="outline" className="h-7 px-3 mx-1 bg-[#F6F6F7] font-medium text-[#F6F6F7] text-sm">
              {chip}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2" onClick={() => removeChip(chip)}>
                <Cross1Icon className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
        </FormItem>
      )}
    />
  );
}
