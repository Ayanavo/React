import { toast } from "@/hooks/use-toast";

const showToast = ({
  title,
  description,
  variant = "default",
  duration = 5000,
}: {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
  duration?: number;
}) => {
  toast({
    title,
    description,
    variant,
    duration,
    // style: {
    //   position: "absolute",
    //   right: "54rem",
    //   bottom: "1rem",
    // },
  });
};

export default showToast;
