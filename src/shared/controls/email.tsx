import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import React, { useEffect } from "react";
import { FieldValue, useFieldArray } from "react-hook-form";
type EmailSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "email";
  validation: { required: boolean };
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
        <div key={field.id} className="flex items-end space-x-2">
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.email`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>{schema.label}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={schema.placeholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.isPrimary`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup onValueChange={() => setPrimaryEmail(index)} value={field.value} className="flex items-center space-x-2">
                    <RadioGroupItem value="true" checked={field.value === true} />
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          {index > 0 && (
            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mb-2">
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Remove email field</span>
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ email: "", isPrimary: false })} className="mt-2">
        <PlusCircledIcon className="mr-2 h-4 w-4" />
        Add Email
      </Button>
    </div>
  );
}

export default email;
