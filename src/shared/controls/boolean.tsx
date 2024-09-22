import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { FieldValue } from "react-hook-form";

function boolean({ form }: { form: FieldValue<any> }) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between space-x-2">
            <FormControl>
              <Switch id="status" checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <Label className="flex-grow m-0" htmlFor="status">
              Currently works
            </Label>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export default boolean;
