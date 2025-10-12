import { Button } from "@/components/ui/button";
import { ImageCropper } from "@/components/ui/image-cropper";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import React, { type ChangeEvent, useMemo, useRef, useState } from "react";
import type { FieldValue } from "react-hook-form";

// Types for the schema (extended with optional capture and aspect)
type ImageSchema = {
  name: string;
  label: string;
  placeholder?: string;
  profileDefaultLink?: string;
  type: "image";
  validation: { required: boolean };
  capture?: boolean | "user" | "environment";
  aspect?: number; // default 1 for square
};

function ImageInput({ form, schema }: { form: FieldValue<any>; schema: ImageSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Preview of the final (cropped) image
  const [imagePreview, setImagePreview] = useState<string>("");

  // Cropper modal state and raw selected image
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string>("");

  const aspect = useMemo(() => schema.aspect ?? 1, [schema.aspect]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRawImage(result);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    form.setValue(schema.name, "");
    setImagePreview("");
    setRawImage("");
  };

  // Derive capture attribute
  const captureAttr = useMemo(() => {
    if (schema.capture === true) return true as unknown as string; // boolean attribute presence
    if (schema.capture === "user" || schema.capture === "environment") return schema.capture;
    return undefined;
  }, [schema.capture]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
        </Label>
      </div>

      <div className="flex items-center gap-4">
        <input
          ref={inputRef}
          id="image-drop"
          type="file"
          accept="image/*"
          {...(captureAttr ? { capture: captureAttr as any } : {})}
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
          {!imagePreview ?
            <div className="absolute inset-0 flex items-center justify-center bg-primary">
              {schema.profileDefaultLink && (
                <img src={schema.profileDefaultLink || "/placeholder.svg"} alt="Default profile" draggable={false} className="w-full h-full object-cover" />
              )}
              {schema.placeholder && <div className="text-4xl text-secondary transition duration-500 text-center">{schema.placeholder}</div>}
            </div>
          : <img width={64} height={64} alt="Selected preview" src={imagePreview || "/placeholder.svg"} draggable={false} className="w-full h-full object-cover" />}
        </div>

        <Button variant="outline" type="button" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>

        {imagePreview && (
          <Button variant="ghost" type="button" size="sm" className="text-muted-foreground" onClick={handleRemove}>
            Remove
          </Button>
        )}
      </div>

      <ImageCropper
        open={cropOpen}
        image={rawImage}
        aspect={aspect}
        onClose={() => setCropOpen(false)}
        onCropped={(croppedDataUrl) => {
          setImagePreview(croppedDataUrl);
          form.setValue(schema.name, croppedDataUrl);
          setCropOpen(false);
        }}
      />
    </div>
  );
}

export default ImageInput;
