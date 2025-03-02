import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import React from "react";
import { FieldValue } from "react-hook-form";

type BooleanSchema = {
  name: string;
  label: string;
  type: "checkbox";
  options: Array<{ label: string; value: string }>;
  validation: { required: boolean };
};
function checkbox({ form, schema }: { form: FieldValue<any>; schema: BooleanSchema }) {
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">
              {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
            </FormLabel>
          </div>

          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={form.watch("skills")?.length === schema.options.length}
                onCheckedChange={(checked) => {
                  return checked ? form.setValue(schema.options.map((item) => item.value)) : form.setValue([]);
                }}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal">Select All</FormLabel>
          </FormItem>

          {schema.options.map((item) => (
            <FormField
              key={item.value}
              control={form.control}
              name={form.name}
              render={({ field }) => (
                <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.value)}
                      onCheckedChange={(checked) => {
                        return checked ? field.onChange([...field.value, item.value]) : field.onChange(field.value?.filter((value: string) => value !== item.value));
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </FormItem>
      )}
    />
  );
}

export default checkbox;
