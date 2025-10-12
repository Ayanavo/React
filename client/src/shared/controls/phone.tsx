import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SquarePlusIcon, TrashIcon } from "lucide-react";
import React, { useEffect } from "react";
import { FieldValue, useFieldArray } from "react-hook-form";
// import flags from "react-phone-number-input/flags";

type PhoneSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "tel";
  validation: { required: boolean };
  single: boolean;
};
function phone({ form, schema }: { form: FieldValue<any>; schema: PhoneSchema }) {
  if (schema.single) {
    // Single controlled phone field (string)
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={schema.name as any}
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>
                {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} placeholder={schema.placeholder} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  // Multiple phones (array of { phone, isPrimary })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: schema.name,
  });

  useEffect(() => {
    !fields.length && append({ phone: "", isPrimary: true });
  }, [fields, append]);

  const setPrimaryPhone = (index: number) => {
    fields.forEach((_, i) => form.setValue(`${schema.name}.${i}.isPrimary`, i === index));
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="relative">
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.phone`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>
                  {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Input value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} placeholder={schema.placeholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.isPrimary`}
            render={({ field }) => (
              <FormItem className="absolute right-2 top-3/4 -translate-y-1/2">
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!field.value} onCheckedChange={() => setPrimaryPhone(index)} aria-label="Primary phone" />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          {!!index && (
            <TrashIcon className="absolute -right-5 top-3/4 -translate-y-1/2 w-4 text-destructive hover:text-destructive/90 cursor-pointer" onClick={() => remove(index)} />
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ phone: "", isPrimary: false })} className="mt-2">
        <SquarePlusIcon className="mr-2 h-4 w-4" />
        Add more
      </Button>
    </div>
  );
}

export default phone;
