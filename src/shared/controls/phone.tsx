import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
};
function phone({ form, schema }: { form: FieldValue<any>; schema: PhoneSchema }) {
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
          {/* <FormField
            name={`${schema.name}.${index}.phone`}
            render={({ field }) => (
              <FormItem className="absolute top-3/4 -translate-y-1/2">
                <div className="flex h-9">
                  <select
                    className="peer inline-flex h-full appearance-none items-center rounded-none rounded-s-md border border-input bg-background pe-8 ps-3 text-sm text-muted-foreground transition-shadow hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Protocol">
                    <option value="https://">https://</option>
                    <option value="http://">http://</option>
                    <option value="ftp://">ftp://</option>
                    <option value="sftp://">sftp://</option>
                    <option value="ws://">ws://</option>
                    <option value="wss://">wss://</option>
                  </select>
                </div>
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name={`${schema.name}.${index}.phone`}
            render={({ field }) => (
              <FormItem className="flex-grow">
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
          <FormField
            control={form.control}
            name={`${schema.name}.${index}.isPrimary`}
            render={({ field }) => (
              <FormItem className="absolute right-2 top-3/4 -translate-y-1/2">
                <FormControl>
                  <RadioGroup onValueChange={() => setPrimaryPhone(index)} value={field.value} className="flex items-center">
                    <RadioGroupItem value="true" checked={field.value === true} />
                  </RadioGroup>
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
