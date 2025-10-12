import { z } from "zod";

// Base field types
export const textField = z.string();
export const numberField = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number());
export const booleanField = z.boolean();
export const emailField = z.string().email();
export const phoneField = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/);

// Validation helpers
export const createAsyncValidator = (validator: (value: string) => Promise<any>) => {
  return (schema: z.ZodString) =>
    schema.refine(async (value: string) => {
      if (!value) return true; // Allow empty, let required handle it
      const result = await validator(value);
      return Array.isArray(result) ? result.length > 0 : result === true;
    }, "Invalid value");
};

// Schema builders
export const createTextField = (options: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp; asyncValidator?: (value: string) => Promise<any> }) => {
  let base: z.ZodString = textField;

  if (options.required) {
    base = base.min(1, "This field is required");
  }

  if (options.minLength) {
    base = base.min(options.minLength, `Minimum ${options.minLength} characters required`);
  }

  if (options.maxLength) {
    base = base.max(options.maxLength, `Maximum ${options.maxLength} characters allowed`);
  }

  if (options.pattern) {
    base = base.regex(options.pattern, "Invalid format");
  }

  if (options.asyncValidator) {
    return createAsyncValidator(options.asyncValidator)(base);
  }

  return base;
};

export const createNumberField = (options: { required?: boolean; min?: number; max?: number }) => {
  let schema: z.ZodTypeAny = numberField;

  if (options.min !== undefined) {
    const min = options.min;
    schema = schema.refine((v: number) => v >= min, `Minimum value is ${min}`);
  }

  if (options.max !== undefined) {
    const max = options.max;
    schema = schema.refine((v: number) => v <= max, `Maximum value is ${max}`);
  }

  return schema;
};

// Predefined schemas
export const createProfileBaseSchema = (mobileSingle: boolean) =>
  z.object({
    themecolor: z.string().optional(),
    fullname: z.string().optional(),
    profile_image: z.string().optional(),
    full_name: z.string().min(1, "Full name is required"),
    mobile:
      mobileSingle ?
        z.string().min(1, "Mobile number is required")
      : z
          .array(
            z.object({
              phone: z.string().min(1, "Mobile number is required"),
              isPrimary: z.boolean(),
            })
          )
          .min(1, "At least one mobile number is required"),

    // Address fields
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
  });

// Schema with async validation (to be used when API is available)
export const createProfileSchemaWithValidation = (mobileSingle: boolean, pincodeValidator?: (value: string, state?: string) => Promise<boolean>) => {
  const baseSchema = createProfileBaseSchema(mobileSingle).omit({ pincode: true });

  if (pincodeValidator) {
    return baseSchema.extend({
      pincode: createAsyncValidator(async (val: string) => pincodeValidator(val))(z.string().min(1, "Pincode is required")),
    });
  }

  return createProfileBaseSchema(mobileSingle);
};

// Advanced schema with cross-field validation
export const createProfileSchemaWithCrossFieldValidation = (validatePincodeAPI: (data: { pincode: string; state: string }) => Promise<any>) => {
  return createProfileBaseSchema(false).refine(
    async (data) => {
      if (!data.pincode || !data.state) return true; // Let required validation handle empty values

      try {
        const response = await validatePincodeAPI({ pincode: data.pincode, state: data.state });
        const result = response?.data ?? [];
        console.log("Cross-field pincode validation result:", result);
        return Array.isArray(result) ? result.length > 0 : result === true;
      } catch (error) {
        console.error("Cross-field pincode validation error:", error);
        return false;
      }
    },
    {
      message: "Pincode is not valid for the selected state",
      path: ["pincode"], // Show error on pincode field
    }
  );
};

// Dynamic schema builder for forms
export const buildFormSchema = (
  fields: Array<{
    name: string;
    type: "text" | "number" | "email" | "phone" | "boolean";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    asyncValidator?: (value: string) => Promise<any>;
  }>
) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case "text":
        shape[field.name] = createTextField({
          required: field.required,
          minLength: field.minLength,
          maxLength: field.maxLength,
          pattern: field.pattern,
          asyncValidator: field.asyncValidator,
        });
        break;
      case "number":
        shape[field.name] = createNumberField({
          required: field.required,
        });
        break;
      case "email":
        shape[field.name] = emailField;
        break;
      case "phone":
        shape[field.name] = phoneField;
        break;
      case "boolean":
        shape[field.name] = booleanField;
        break;
    }
  });

  return z.object(shape);
};
