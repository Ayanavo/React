import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
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
              {schema.options.map((option) => (
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
