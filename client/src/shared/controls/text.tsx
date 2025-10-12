import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { UseFormReturn } from "react-hook-form";

type TextSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "text";
  validation?: {
    required?: boolean;
    pattern?: RegExp;
  };
};

function Text({ form, schema }: { form: UseFormReturn<any>; schema: TextSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation?.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder={schema.placeholder} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default Text;
