import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";
import { FieldValue } from "react-hook-form";

type DropdownSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "list";
  options: Array<{ label: string; value: string }>;
  validation: { required: boolean };
};

function dropdown({ form, schema }: { form: FieldValue<any>; schema: DropdownSchema }) {
  const [optionList, setOptionList] = useState<Array<{ label: string; value: string }>>(schema.options);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e) {
      const value = e.target.value;
      setOptionList(schema.options.filter((item) => (item.value?.toLowerCase() || "").includes(value.toLowerCase() || "")));
    }
  };

  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>

          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={schema.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <div className="p-1 sticky top-0 z-10 bg-popover">
                <input
                  type="search"
                  placeholder="Search..."
                  className="
                    flex h-8 w-full rounded-md border border-input 
                    bg-background px-3 py-2 text-sm 
                    ring-offset-background 
                    file:border-0 file:bg-transparent file:text-sm file:font-medium
                    placeholder:text-muted-foreground 
                    disabled:cursor-not-allowed disabled:opacity-50"
                  onInput={handleInput}
                />
              </div>

              {optionList.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

export default dropdown;
