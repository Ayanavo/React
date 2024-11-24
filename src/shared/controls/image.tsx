import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

function image() {
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="flex items-center gap-4">
      <input ref={inputRef} id="image-drop" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
        {isUploading ?
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        : <img width={64} height={64} alt="Logo" src={image} className="profile-image" />}
      </div>
      <Button variant="outline" type="button" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Image
      </Button>
      {image && (
        <Button variant="ghost" type="button" size="sm" className="text-muted-foreground" onClick={() => setImage("")}>
          Remove
        </Button>
      )}
    </div>
  );
}

export default image;
