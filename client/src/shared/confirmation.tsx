import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { LoaderCircleIcon } from "lucide-react";
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

type DialogType = "confirm" | "info";

type ConfirmOptions = {
  type?: DialogType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showLoadingOnConfirmClick?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

type ConfirmDialogContextValue = {
  confirm: ConfirmFn;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

function ConfirmationDialog({
  isOpen,
  type,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  closeOnBackdrop = true,
  showLoadingOnConfirmClick = false,
}: {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  closeOnBackdrop?: boolean;
  showLoadingOnConfirmClick?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  // IMPORTANT: handle close (ESC / backdrop) as "Cancel"
  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(event) => {
          if (!closeOnBackdrop) event.preventDefault();
        }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>

        {type === "confirm" && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(false);
                onCancel();
              }}>
              {cancelText}
            </Button>

            <Button
              disabled={loading}
              onClick={() => {
                if (showLoadingOnConfirmClick) setLoading(true);
                onConfirm();
              }}>
              {loading && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
              {confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [opts, setOpts] = useState<
    Required<
      Pick<ConfirmOptions, "message" | "type" | "title" | "confirmText" | "cancelText" | "showLoadingOnConfirmClick">
    >
  >({
    title: "Confirm Action",
    type: "confirm",
    message: "",
    confirmText: "Accept",
    cancelText: "Cancel",
    showLoadingOnConfirmClick: false,
  });

  // keep resolver in a ref so it doesn't get stale
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const cleanupAndClose = useCallback(() => {
    setIsOpen(false);
    resolverRef.current = null;
  }, []);

  const resolveOnce = useCallback(
    (value: boolean) => {
      // resolve exactly once
      const r = resolverRef.current;
      if (!r) return;
      r(value);
      cleanupAndClose();
    },
    [cleanupAndClose]
  );

  const confirm: ConfirmFn = useCallback((options) => {
    const normalized: ConfirmOptions = typeof options === "string" ? { message: options } : options;

    return new Promise<boolean>((resolve) => {
      // If a dialog is already open, cancel it (or you can queue; this keeps it simple)
      if (resolverRef.current) resolverRef.current(false);

      resolverRef.current = resolve;

      setOpts({
        title: normalized.title ?? "Confirm Action",
        type: normalized.type ?? "confirm",
        message: normalized.message,
        confirmText: normalized.confirmText ?? "Accept",
        cancelText: normalized.cancelText ?? "Cancel",
        showLoadingOnConfirmClick: normalized.showLoadingOnConfirmClick ?? false,
      });

      setIsOpen(true);
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}

      <ConfirmationDialog
        isOpen={isOpen}
        type={opts.type}
        title={opts.title}
        message={opts.message}
        confirmText={opts.confirmText}
        cancelText={opts.cancelText}
        showLoadingOnConfirmClick={opts.showLoadingOnConfirmClick}
        onConfirm={() => resolveOnce(true)}
        onCancel={() => resolveOnce(false)}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return ctx;
}
