import React, { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/pages/settings/theme";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function getEffectiveTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

const toastVariantForeground =
  "[&_[data-title]]:font-medium [&_[data-icon]]:shrink-0";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => getEffectiveTheme(theme));

  useEffect(() => {
    setResolvedTheme(getEffectiveTheme(theme));

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(getEffectiveTheme("system"));
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: cn(
            toastVariantForeground,
            "[&_[data-title]]:!text-chart-2 [&_[data-icon]]:!text-chart-2"
          ),
          error: cn(
            toastVariantForeground,
            "[&_[data-title]]:!text-destructive [&_[data-icon]]:!text-destructive"
          ),
          warning: cn(
            toastVariantForeground,
            "[&_[data-title]]:!text-chart-4 [&_[data-icon]]:!text-chart-4"
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
