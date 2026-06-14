import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import React from "react";

type AddActionButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export function AddActionButton({ label, onClick, type = "button", className }: AddActionButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      aria-label={label}
      className={cn("h-9 w-9 shrink-0 p-0 shadow-sm sm:w-auto sm:px-4 sm:py-2", className)}>
      <PlusIcon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export default AddActionButton;
