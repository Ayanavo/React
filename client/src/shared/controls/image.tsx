import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { FieldValue } from "react-hook-form";
type ImageSchema = {
  name: string;
  label: string;
  placeholder?: string;
  profileDefaultLink?: string;
  type: "image";
  validation: { required: boolean };
};

function image({ form, schema }: { form: FieldValue<any>; schema: ImageSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        form.setValue(schema.name, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
        </Label>
      </div>

      <div className="flex items-center gap-4">
        <input ref={inputRef} id="image-drop" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
          {!imagePreview ?
            <div className="absolute inset-0 flex items-center justify-center bg-primary">
              {schema.profileDefaultLink && <img src={schema.profileDefaultLink} alt="image" draggable={false} className="w-full h-full" />}
              {schema.placeholder && <div className="text-4xl text-secondary transition duration-500 text-center">{schema.placeholder}</div>}
            </div>
          : <img width={64} height={64} alt="Logo" src={imagePreview} draggable={false} className="profile-image" />}
        </div>
        <Button variant="outline" type="button" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        {imagePreview && (
          <Button
            variant="ghost"
            type="button"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              form.setValue("");
              setImagePreview("");
            }}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export default image;
