import { z } from "zod";

type FormGeneral = {
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
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
    let schema: z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodDate | z.ZodEffects<any> | z.ZodUnion<[z.ZodString, z.ZodNumber]>;

    // Base schema
    switch (field.type) {
      case "boolean":
        schema = z.boolean();
        break;

      case "number":
        // Accept numeric string or number
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

      case "checkbox":
        schema = z.boolean();
        break;

      default:
        schema = z.string();
        break;
    }

    // Required rule (only for string-like fields)
    if (field.validation?.required && schema instanceof z.ZodString) {
      schema = schema.min(1, `${label} is required`);
    }

    // Min/Max length (only for strings)
    if (schema instanceof z.ZodString) {
      if (field.validation?.minLength) schema = schema.min(field.validation.minLength, `${label} must be at least ${field.validation.minLength} characters`);
      if (field.validation?.maxLength) schema = schema.max(field.validation.maxLength, `${label} must be at most ${field.validation.maxLength} characters`);
    }

    // Pattern (only for strings)
    if (schema instanceof z.ZodString && field.validation?.pattern) {
      schema = schema.regex(field.validation.pattern, `${label} has invalid format`);
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
