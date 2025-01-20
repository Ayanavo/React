import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import React, { ChangeEvent, useRef } from "react";
import { FieldValue } from "react-hook-form";
type ImageSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "image";
  validation: { required: boolean };
};

function image({ form, schema }: { form: FieldValue<any>; schema: ImageSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        form.setValue(schema.name, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{schema.label}</Label>
      </div>

      <div className="flex items-center gap-4">
        <input ref={inputRef} id="image-drop" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
          {!form.getValues(schema.name) ?
            <div className="absolute inset-0 flex items-center justify-center bg-primary">
              <div className="text-4xl text-secondary transition duration-500 text-center">AL</div>
            </div>
          : <img width={64} height={64} alt="Logo" src={form.getValues(schema.name)} className="profile-image" />}
        </div>
        <Button variant="outline" type="button" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        {form.getValues(schema.name) && (
          <Button variant="ghost" type="button" size="sm" className="text-muted-foreground" onClick={() => form.setValue("")}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export default image;
