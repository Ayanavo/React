import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z, { ZodType } from "zod";

type formGeneral = { validation: any; name: string; placeholder?: string; label?: string; type: string; default?: any };
function validation(formschema: Array<formGeneral>): ZodType<any> {
  return z.object(
    formschema.reduce((acc: { [index: string]: any }, field) => {
      if (field.validation?.required && (typeof field.default === "string" || field.default === "undefined")) {
        acc[field.name] = z.string().min(1, {
          message: `${field.label} is required`,
        });
      } else if (field.validation?.minLength) {
        acc[field.name] = z.string().min(field.validation.minLength, {
          message: `${field.label} must be at least ${field.validation.minLength} characters`,
        });
      } else if (field.validation?.maxLength) {
        acc[field.name] = z.string().max(field.validation.maxLength, {
          message: `${field.label} must be at most ${field.validation.maxLength} characters`,
        });
      } else if (field.validation?.pattern) {
        acc[field.name] = z.string().regex(field.validation.pattern, {
          message: `${field.label} has invalid format`,
        });
      } else if (field.validation?.email) {
        acc[field.name] = z.array(
          z.object({
            email: z.string().email({
              message: `${field.label} must be a valid email address`,
            }),
            isPrimary: z.boolean(),
          })
        );
      } else if (field.validation?.url) {
        acc[field.name] = z.string().url({
          message: `${field.label} must be a valid URL`,
        });
      } else if (field.type === "checkbox") {
        acc[field.name] = z.boolean();
      } else if (field.type === "number") {
        acc[field.name] = z.number();
      } else if (field.type === "boolean") {
        acc[field.name] = z.boolean();
      } else if (field.type === "date") {
        acc[field.name] = z.date();
      } else if (field.type === "emailsingle") {
        acc[field.name] = z.string().email({
          message: `${field.label} must be a valid email address`,
        });
      } else {
        acc[field.name] = z.string();
      }
      return acc;
    }, {})
  );
}

export default function generateControl(formSchema: Array<formGeneral>) {
  return useForm({
    resolver: zodResolver(validation(formSchema)),
    defaultValues: formSchema.reduce((acc: { [index: string]: any }, val) => {
      acc[val.name] = val?.default ?? "";
      return acc;
    }, {}),
  });
}
