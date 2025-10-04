import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { UseFormReturn } from "react-hook-form";

type TextSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "text";
  validation: {
    required: boolean;
    pattern?: RegExp;
    asyncValidator?: (value: string, state?: string) => Promise<Array<any>>;
  };
};

function Text({ form, schema }: { form: UseFormReturn<any>; schema: TextSchema }) {
  //validation rules
  const rules: Record<string, any> = {
    required: schema.validation.required,
  };

  if (schema.validation.pattern) {
    rules.pattern = schema.validation.pattern;
  }

  return (
    <FormField
      control={form.control}
      name={schema.name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={schema.placeholder}
              value={field.value ?? ""}
              onBlur={async () => {
                field.onBlur();
                // Manually call async validation for fields with async validators
                if (schema.validation.asyncValidator) {
                  try {
                    const result = await schema.validation.asyncValidator(field.value || "");
                    if (!result.length) {
                      form.setError(schema.name, {
                        type: "manual",
                        message: result.message,
                      });
                    } else {
                      form.clearErrors(schema.name);
                    }
                  } catch (error) {
                    console.error(`Validation error for ${schema.name}:`, error);
                    form.setError(schema.name, {
                      type: "manual",
                      message: error.data.message,
                    });
                  }
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default Text;
