import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { buildValidationSchema } from "./validationBuilder";

export default function generateControl(formSchema: Array<any>, options?: any) {
  // ⚡ Memoize schema build so it doesn't re-run infinitely
  const resolver = React.useMemo(() => {
    let resolved = false;
    let resolverFn: any;

    // Wrap async resolver builder inside a lazy promise
    const promise = buildValidationSchema(formSchema).then((schema) => {
      resolverFn = zodResolver(schema);
      resolved = true;
      return resolverFn;
    });

    // Return a function that calls the resolver after ready
    const asyncResolver = async (values: any, context: any, options: any) => {
      if (!resolved) await promise;
      return resolverFn(values, context, options);
    };

    return asyncResolver;
  }, [JSON.stringify(formSchema)]); // ✅ only rebuild if schema truly changes

  // Default values
  const defaultValues = React.useMemo(() => {
    return formSchema.reduce((acc: any, field) => {
      acc[field.name] = field?.default ?? "";
      return acc;
    }, {});
  }, [JSON.stringify(formSchema)]);

  // Create form — resolver will run async-safe
  const form = useForm({
    resolver,
    defaultValues,
    ...options,
  });

  return form;
}
