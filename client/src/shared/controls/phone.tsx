import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ISD_OPTIONS, findIsdOption } from "@/shared/utils/mobile-isd";
import { SquarePlusIcon, TrashIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FieldValue, useFieldArray } from "react-hook-form";

type PhoneSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "tel";
  validation: { required: boolean };
  single: boolean;
  isdName?: string;
  countryName?: string;
};

function SinglePhoneField({
  form,
  schema,
  action,
}: {
  form: FieldValue<any>;
  schema: PhoneSchema;
  action?: React.ReactNode;
}) {
  const isdFieldName = schema.isdName ?? "mobileIsd";
  const countryFieldName = schema.countryName ?? "mobileCountry";
  const [isdSearch, setIsdSearch] = useState("");

  const selectedCountry = form.watch(countryFieldName) as string | undefined;
  const selectedIsd = form.watch(isdFieldName) as string | undefined;
  const activeOption = useMemo(() => findIsdOption(selectedIsd, selectedCountry), [selectedCountry, selectedIsd]);

  const filteredOptions = useMemo(() => {
    const query = isdSearch.trim().toLowerCase();
    if (!query) return ISD_OPTIONS;
    return ISD_OPTIONS.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.isd.includes(query) ||
        option.iso.toLowerCase().includes(query)
    );
  }, [isdSearch]);

  const handleIsdChange = (iso: string) => {
    const option = findIsdOption(undefined, iso);
    form.setValue(countryFieldName, option.iso, { shouldDirty: true, shouldValidate: true });
    form.setValue(isdFieldName, option.isd, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <FormField
      control={form.control}
      name={schema.name as any}
      render={({ field }) => (
        <FormItem className="min-w-0">
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <div className="flex items-center gap-2">
            <Select
              value={activeOption.iso}
              onValueChange={handleIsdChange}
              onOpenChange={(open) => {
                if (!open) setIsdSearch("");
              }}>
              <SelectTrigger className="h-9 w-[7.5rem] shrink-0 px-2">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{activeOption.flag}</span>
                    <span className="text-sm">+{activeOption.isd}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-72 w-[18rem]">
                <div className="sticky top-0 z-10 bg-popover p-1">
                  <input
                    type="search"
                    value={isdSearch}
                    onChange={(event) => setIsdSearch(event.target.value)}
                    placeholder="Search country or code"
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    onKeyDown={(event) => event.stopPropagation()}
                  />
                </div>
                {filteredOptions.map((option) => (
                  <SelectItem key={option.iso} value={option.iso}>
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{option.flag}</span>
                      <span className="min-w-0 flex-1 truncate">{option.name}</span>
                      <span className="text-muted-foreground">+{option.isd}</span>
                    </span>
                  </SelectItem>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="px-2 py-3 text-center text-sm text-muted-foreground">No matches</div>
                )}
              </SelectContent>
            </Select>

            <FormControl>
              <Input
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                inputMode="tel"
                placeholder={schema.placeholder}
                className="min-w-0 flex-1"
              />
            </FormControl>
            {action}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MultiPhoneField({ form, schema }: { form: FieldValue<any>; schema: PhoneSchema }) {
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
                  <Input
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    placeholder={schema.placeholder}
                  />
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
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={() => setPrimaryPhone(index)}
                      aria-label="Primary phone"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          {!!index && (
            <TrashIcon
              className="absolute -right-5 top-3/4 -translate-y-1/2 w-4 text-destructive hover:text-destructive/90 cursor-pointer"
              onClick={() => remove(index)}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ phone: "", isPrimary: false })}
        className="mt-2">
        <SquarePlusIcon className="mr-2 h-4 w-4" />
        Add more
      </Button>
    </div>
  );
}

function phone({ form, schema, action }: { form: FieldValue<any>; schema: PhoneSchema; action?: React.ReactNode }) {
  if (schema.single) {
    return <SinglePhoneField form={form} schema={schema} action={action} />;
  }

  return <MultiPhoneField form={form} schema={schema} />;
}

export default phone;
