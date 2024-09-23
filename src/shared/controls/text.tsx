import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { FieldValue } from "react-hook-form";
type TextSchema = {
  name: string;
  label: string;
  type: "text";
  validation: { required: boolean };
};

function text({ form, schema }: { form: FieldValue<any>; schema: TextSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default text;
