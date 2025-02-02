import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import React, { useState } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: (result: boolean) => void;
  onCancel: () => void;
  message: string;
}

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? onConfirm(true) : onCancel())}>
      <DialogContent>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onConfirm(true)}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [resolvePromise, setResolvePromise] = useState<((result: boolean) => void) | null>(null);

  const openDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
      setMessage(message);
      setIsOpen(true);
    });
  };

  const handleConfirm = (result: boolean): void => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(result);
    }
  };

  const handleCancel = (): void => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
    }
  };

  return {
    openDialog,
    ConfirmationDialog: <ConfirmationDialog isOpen={isOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={message} />,
  };
};
