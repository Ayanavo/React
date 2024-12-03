import React, { ChangeEvent, InputHTMLAttributes, useRef, useState } from "react";

type UseImageToBase64WithInputReturn = {
  image: string | null;
  error: string | null;
  renderInputField: (props?: InputHTMLAttributes<HTMLInputElement>) => JSX.Element;
  activateInput: () => void;
};

function imageFile(): UseImageToBase64WithInputReturn {
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setError("");
      }
    };
    reader.onerror = () => {
      setError("Failed to load image.");
      setImage("");
    };
    reader.readAsDataURL(file);
  };

  const activateInput = () => {
    inputRef.current?.click();
  };

  const renderInputField = (props?: InputHTMLAttributes<HTMLInputElement>): JSX.Element => (
    <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" {...props} />
  );

  return { image, error, renderInputField, activateInput };
}

export default imageFile;
