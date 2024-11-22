import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z, { ZodType } from "zod";
function validation(formschema: Array<{ validation: any; name: string; label: string; type: string }>): ZodType<any> {
  return z.object(
    formschema.reduce((acc: { [index: string]: any }, field) => {
      if (field.validation?.required) {
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
          message: `${field.label} must match the pattern ${field.validation.pattern}`,
        });
      } else if (field.validation?.email) {
        acc[field.name] = z.string().email({
          message: `${field.label} must be a valid email address`,
        });
      } else if (field.validation?.url) {
        acc[field.name] = z.string().url({
          message: `${field.label} must be a valid URL`,
        });
      } else if (field.type === "number") {
        acc[field.name] = z.number();
      } else if (field.type === "boolean") {
        acc[field.name] = z.boolean();
      } else if (field.type === "date") {
        acc[field.name] = z.date();
      } else {
        console.log(field.name);

        acc[field.name] = z.string();
      }
      return acc;
    }, {})
  );
}

export default function generateControl(formSchema: Array<{ validation: any; name: string; label: string; type: string; default?: any }>) {
  return useForm({
    resolver: zodResolver(validation(formSchema)),
    defaultValues: formSchema.reduce((acc: { [index: string]: any }, val) => {
      acc[val.name] = val?.default ?? "";
      return acc;
    }, {}),
  });
}
