import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { FieldValue } from "react-hook-form";

type TextareaSchema = {
  name: string;
  label: string;
  type: "textarea";
  validation: { required: boolean };
};

function textarea({ form, schema }: { form: FieldValue<any>; schema: TextareaSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.label}</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default textarea;
