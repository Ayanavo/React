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

const MAX_BASE64_IMAGE_BYTES = 1024 * 1024; //1 MB
const IMAGE_QUALITY_STEPS = [0.92, 0.82, 0.72, 0.62, 0.52, 0.42, 0.32];

function getDataUrlSizeInBytes(dataUrl: string) {
  return dataUrl.length;
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function optimizeBase64Image(dataUrl: string) {
  if (getDataUrlSizeInBytes(dataUrl) <= MAX_BASE64_IMAGE_BYTES) return dataUrl;

  const image = await dataUrlToImage(dataUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return dataUrl;

  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;
  let bestDataUrl = dataUrl;

  while (width >= 1 && height >= 1) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of IMAGE_QUALITY_STEPS) {
      const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
      bestDataUrl = optimizedDataUrl;

      if (getDataUrlSizeInBytes(optimizedDataUrl) <= MAX_BASE64_IMAGE_BYTES) {
        return optimizedDataUrl;
      }
    }

    const reductionRatio = Math.sqrt(MAX_BASE64_IMAGE_BYTES / Math.max(getDataUrlSizeInBytes(bestDataUrl), 1));
    const scale = Math.min(0.85, Math.max(0.5, reductionRatio * 0.9));
    width *= scale;
    height *= scale;
  }

  return bestDataUrl;
}

function ImageInput({ form, schema }: { form: FieldValue<any>; schema: ImageSchema }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Preview of the final (cropped) image
  const [imagePreview, setImagePreview] = useState<string>("");

  // Cropper modal state and raw selected image
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string>("");

  const aspect = useMemo(() => schema.aspect ?? 1, [schema.aspect]);
  const displayImage = imagePreview || schema.profileDefaultLink || "";

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

        <button
          type="button"
          className="group relative w-16 h-16 border rounded-lg overflow-hidden disabled:cursor-default"
          disabled={!displayImage}
          aria-label={displayImage ? "View selected image" : undefined}>
          {!displayImage ?
            <div className="absolute inset-0 flex items-center justify-center bg-primary">
              {schema.placeholder && (
                <div className="text-4xl text-secondary transition duration-500 text-center">{schema.placeholder}</div>
              )}
            </div>
          : <img
              width={64}
              height={64}
              alt="Selected preview"
              src={displayImage || "/placeholder.svg"}
              draggable={false}
              className="w-full h-full object-cover"
            />
          }
        </button>

        <Button variant="outline" type="button" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>

        {displayImage && (
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
        onCropped={async (croppedDataUrl) => {
          const optimizedDataUrl = await optimizeBase64Image(croppedDataUrl);

          setImagePreview(optimizedDataUrl);
          form.setValue(schema.name, optimizedDataUrl);
          setCropOpen(false);
        }}
      />
    </div>
  );
}

export default ImageInput;
