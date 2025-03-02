import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadIcon } from "@radix-ui/react-icons";
import { Progress } from "@/components/ui/progress";
import React, { useRef } from "react";
import { FieldValue } from "react-hook-form";
import { FileIcon, Trash2Icon } from "lucide-react";

type FileSchema = {
  name: string;
  label?: string;
  placeholder?: string;
  validation: { required: boolean; maxSize: "16Mb"; multiple: boolean };
};

function file({ form, schema }: { form: FieldValue<any>; schema: FileSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function convertBytes(size: number): string {
    if (size === 0) return "0.00 b";
    const sizes = ["b", "kb", "mb", "gb"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={() => (
        <FormItem>
          {schema?.label && (
            <FormLabel>
              {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const files = schema.validation.multiple ? e.dataTransfer.files : [e.dataTransfer.files[e.dataTransfer.files.length - 1]];
              files && form.setValue(schema.name, Array.from(files));
              e.preventDefault();
            }}
            className="flex w-full items-center justify-center rounded-md border border-solid shadow-sm border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <UploadIcon className="h-5 w-5 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Max Size: {schema.validation.maxSize || "500Mb"}</p>
            </div>
            <input
              ref={inputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              multiple={schema.validation.multiple}
              onChange={(e) => e.target.files && form.setValue(schema.name, Array.from(e.target.files))}
            />
          </div>
          <ol aria-label="dropzone-file-list" className="flex flex-col gap-3">
            {form.getValues(schema.name)?.map((file: File) => (
              <li key={file.name} aria-label="dropzone-file-list-item" className="justify-center rounded-md bg-muted/40 px-4 py-2 flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="flex min-w-0 items-center gap-2 font-bold">
                    <FileIcon className="h-4 w-4 mr-2" />
                    <p className="truncate">{file.name}</p>
                  </div>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      const allfields = form.getValues(schema.name);
                      allfields.splice(
                        allfields.findIndex((_file: File) => _file.name === file.name),
                        1
                      );
                      form.setValue(schema.name, allfields);
                    }}>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    <span className="sr-only">Remove file</span>
                  </div>
                </div>
                <Progress value={0} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">{convertBytes(file.size)}</div>
              </li>
            ))}
          </ol>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default file;
