import { toast } from "sonner";

function showToast({ title, description, variant }: { title: string; description?: string; variant: "success" | "error" | "warning" }) {
  toast[variant](title, {
    description,
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  });
}

export default showToast;
