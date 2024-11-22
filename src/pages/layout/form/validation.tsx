import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z, { ZodType } from "zod";
function validation(formschema: Array<{ validation: any; name: string; label: string }>): ZodType<any> {
  return z.object(
    formschema.reduce((acc: { [index: string]: any }, field) => {
      if (field.validation?.required) {
        acc[field.name] = z.string().min(1, {
          message: `${field.label} is required`,
        });
      } else {
        acc[field.name] = z.string();
      }
      return acc;
    }, {})
  );
}

export default function generateControl(formSchema: Array<{ validation: any; name: string; label: string }>) {
  return useForm({
    resolver: zodResolver(validation(formSchema)),
    defaultValues: { title: "", fname: "", lname: "" },
  });
}
