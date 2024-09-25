import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { FieldValue } from "react-hook-form";
type PhoneSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "tel";
  validation: { required: boolean };
};
function phone({ form, schema }: { form: FieldValue<any>; schema: PhoneSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.label}</FormLabel>
          <FormControl>
            <Input {...field} placeholder={schema.placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default phone;
