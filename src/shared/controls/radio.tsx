import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";
import { FieldValue } from "react-hook-form";

type RadioSchema = {
  name: string;
  label: string;
  type: "radio";
  options: Array<{ label: string; value: string }>;
  validation: { required: boolean };
};

function radio({ form, schema }: { form: FieldValue<any>; schema: RadioSchema }) {
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
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
              {schema.options.map((item) => (
                <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{item.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default radio;
