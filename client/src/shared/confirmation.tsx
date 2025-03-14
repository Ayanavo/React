import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import React, { Dispatch, SetStateAction, useState } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: (result: boolean) => void;
  onCancel: () => void;
  message: string;
}

function ConfirmationDialog({ isOpen, onConfirm, onCancel, message }: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? onConfirm(true) : onCancel())}>
      <DialogOverlay className="DialogOverlay">
        <DialogContent>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" className="bg-primary text-secondary hover:bg-primary hover:text-secondary" onClick={() => onConfirm(true)}>
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [resolvePromise, setResolvePromise] = useState<((result: boolean, callback?: Dispatch<SetStateAction<boolean>>) => void) | null>(null);

  const openDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
      setMessage(message);
      setIsOpen(true);
    });
  };

  const handleConfirm = (result: any): void => {
    if (resolvePromise) {
      resolvePromise(result, setIsOpen);
    }
  };

  const handleCancel = (): void => {
    if (resolvePromise) {
      resolvePromise(false, setIsOpen);
    }
  };

  return {
    openDialog,
    ConfirmationDialog: <ConfirmationDialog isOpen={isOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={message} />,
  };
};
