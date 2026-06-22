import { toast } from "sonner";

const TERMS_PATH = "/terms";

export function showCacheUseWarning() {
  toast.warning("Cache required", {
    description:
      "This application needs browser cache and local storage enabled to function properly. Do not disable cache or block site data for this app.",
    action: {
      label: "Terms & Conditions",
      onClick: () => {
        window.location.hash = `#${TERMS_PATH}`;
      },
    },
    closeButton: true,
    richColors: true,
  });
}

export { TERMS_PATH };
