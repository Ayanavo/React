import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SquarePlusIcon, TrashIcon } from "lucide-react";
import React, { useEffect } from "react";
import { FieldValue, useFieldArray } from "react-hook-form";
type EmailSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "email";
  validation: { required: boolean };
  field_prop?: {
    single: boolean;
  };
};
function email({ form, schema }: { form: FieldValue<any>; schema: EmailSchema }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: schema.name,
  });

  useEffect(() => {
    !fields.length && append({ email: "", isPrimary: true });
  }, [fields, append]);

  const setPrimaryEmail = (index: number) => {
    fields.forEach((_, i) => form.setValue(`${schema.name}.${i}.isPrimary`, i === index));
  };
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="relative">
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.email`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>
                  {schema.label}
                  {schema.validation.required && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder={schema.placeholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!schema.field_prop?.single && (
            <FormField
              control={form.control}
              name={`${schema.name}.${index}.isPrimary`}
              render={({ field }) => (
                <FormItem className="absolute right-2 top-3/4 -translate-y-1/2">
                  <FormControl>
                    <RadioGroup onValueChange={() => setPrimaryEmail(index)} value={field.value} className="flex items-center ">
                      <RadioGroupItem value="true" checked={field.value === true} />
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {!!index && (
            <TrashIcon className="absolute -right-5 top-3/4 -translate-y-1/2 w-4 text-destructive hover:text-destructive/90 cursor-pointer" onClick={() => remove(index)} />
          )}
        </div>
      ))}
      {!schema.field_prop?.single && (
        <Button type="button" variant="outline" size="sm" onClick={() => append({ email: "", isPrimary: false })} className="mt-2">
          <SquarePlusIcon className=" mr-2 h-4 w-4" />
          Add more
        </Button>
      )}
    </div>
  );
}

export default email;
