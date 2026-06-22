import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormGeneral = {
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    asyncValidator?: (value: string, label?: string) => Promise<boolean | string>;
  };
  name: string;
  label?: string;
  type: string;
  default?: any;
};

/**
 * Builds a type-safe Zod validation schema dynamically from form configuration.
 * Supports async validators (API calls) through .refine(async ...)
 */
export async function buildValidationSchema(formSchema: Array<FormGeneral>) {
  const shape: Record<string, any> = {};

  for (const field of formSchema) {
    const label = field.label ?? field.name;
    let schema: z.ZodTypeAny;

    // Base schema
    switch (field.type) {
      case "boolean":
        schema = z.boolean();
        break;

      case "number":
        schema = z
          .union([z.string(), z.number()])
          .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
          .refine((v) => !isNaN(v), { message: `${label} must be a valid number` });
        break;

      case "date":
        schema = z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), `${label} must be a valid date`)
          .transform((val) => new Date(val));
        break;

      case "image":
        schema = z.any();
        break;

      case "checkbox":
        schema = z.boolean();
        break;

      case "emailsingle":
        schema = z.string().email(`${label} must be a valid email`);
        break;

      default:
        schema = z.string();
        break;
    }

    // String-only rules
    if (schema instanceof z.ZodString) {
      let stringSchema = schema;

      if (field.validation?.required) {
        stringSchema = stringSchema.min(1, `${label} is required`);
      }

      if (field.validation?.minLength) {
        stringSchema = stringSchema.min(
          field.validation.minLength,
          `${label} must be at least ${field.validation.minLength} characters`
        );
      }

      if (field.validation?.maxLength) {
        stringSchema = stringSchema.max(
          field.validation.maxLength,
          `${label} must be at most ${field.validation.maxLength} characters`
        );
      }

      if (field.validation?.pattern) {
        stringSchema = stringSchema.regex(
          field.validation.pattern,
          field.validation.patternMessage ?? `${label} has invalid format`
        );
      }

      schema = stringSchema;
    }

    // Async validator
    if (field.validation?.asyncValidator) {
      schema = schema.refine(
        async (value) => {
          const result = await field.validation!.asyncValidator!(value as string, label);
          return result === true;
        },
        {
          message: `${label} is invalid`,
        }
      );
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

// Generic form hook for any schema
export const useZodForm = <T extends z.ZodType>(schema: T, defaultValues?: any, options?: any) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
    ...options,
  });
};
