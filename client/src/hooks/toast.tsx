import { toast } from "sonner";

function showToast({ title, description, variant, undo = false }: { title: string; description?: string; variant: "success" | "error" | "warning"; undo?: boolean }): void {
  toast[variant](title, {
    description,
    ...(undo && {
      cancel: {
        label: "Undo",
        onClick: () => toast.dismiss(),
      },
    }),
    closeButton: true,
    richColors: true,
  });
}

export default showToast;
