import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadIcon } from "@radix-ui/react-icons";
import React, { useRef } from "react";
import { FieldValue } from "react-hook-form";

type FileSchema = {
  name: string;
  label: string;
  validation: { required: boolean; maxSize: "16Mb" };
};

function file({ form, schema }: { form: FieldValue<any>; schema: FileSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={() => (
        <FormItem>
          <FormLabel>{schema.label}</FormLabel>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              file && form.setValue("file", file);
            }}
            className="flex w-full items-center justify-center rounded-md border border-solid shadow-sm border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <UploadIcon className="h-5 w-5 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Max Size: {schema.validation.maxSize || "500Mb"}</p>
            </div>
            <input ref={inputRef} id="dropzone-file" type="file" className="hidden" />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default file;
