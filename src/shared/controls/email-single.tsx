import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { FieldValue } from "react-hook-form";
type EmailSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "emailsingle";
  validation: { required: boolean };
};

function emailSingle({ form, schema }: { form: FieldValue<any>; schema: EmailSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder={schema.placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default emailSingle;
