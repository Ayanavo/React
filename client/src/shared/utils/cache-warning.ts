import { toast } from "sonner";

import { TERMS_PATH } from "@/shared/utils/policy-paths";

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
  });
}

export { TERMS_PATH };
