import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { FieldValue } from "react-hook-form";

function textarea({ form }: { form: FieldValue<any> }) {
  return (
    <FormField
      control={form.control}
      name="textarea"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Comments</FormLabel>
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