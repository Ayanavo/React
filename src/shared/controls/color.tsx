import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { OpacityIcon } from "@radix-ui/react-icons";
import React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { FieldValue } from "react-hook-form";

type ColorSchema = {
  name: string;
  label?: string;
  placeholder?: string;
  type: "color";
  validation: { required: boolean };
};

function color({ form, schema }: { form: FieldValue<any>; schema: ColorSchema }) {
  const handleColorChange = (color: ColorResult) => {
    form.setValue(schema.name, color.hex);
  };

  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {schema?.label && (
            <FormLabel>
              {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                {field.value ?
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: field.value }} />
                    <span>{field.value}</span>
                  </div>
                : <span>{schema.label}</span>}
                <OpacityIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <SketchPicker color={field.value} onChange={handleColorChange} />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default color;
