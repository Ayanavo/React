import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React from "react";
import { FieldValue } from "react-hook-form";
import ReactQuill, { ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./custom.scss";
type EditorSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "html";
  validation: { required: boolean };
};

function editor({ form, schema }: { form: FieldValue<any>; schema: EditorSchema }) {
  const editorConfig: ReactQuillProps = {
    modules: {
      toolbar: [
        [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        // [{ lineHeight: ["1", "1.5", "2", "2.5", "3"] }],
        ["clean"],
      ],
    },
    placeholder: schema.placeholder,
    theme: "snow",
  };
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <ReactQuill className="custom-quill-ghost" {...field} {...editorConfig} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default editor;
