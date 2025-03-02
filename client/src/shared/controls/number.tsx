import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { FieldValue } from "react-hook-form";
type NumberSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "number";
  validation: { required: boolean };
};

function number({ form, schema }: { form: FieldValue<any>; schema: NumberSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label}
            {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input type="number" {...field} placeholder={schema.placeholder} onChange={(value) => field.onChange(value.target.valueAsNumber)} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default number;
