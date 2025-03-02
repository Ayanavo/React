import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import React, { useState } from "react";

interface SheetProps {
  isOpen: boolean;
  onConfirm: (result: boolean) => void;
  onCancel: () => void;
  children: JSX.Element;
}
function SidebarLayout({ children, isOpen, onConfirm, onCancel }: SheetProps): JSX.Element {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onConfirm(true) : onCancel())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Sub title</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">{children}</div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Submit</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
export const useSidebarLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((result: boolean) => void) | null>(null);

  const openSidebar = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
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
    openSidebar,
    SidebarPanel: <SidebarLayout isOpen={isOpen} onConfirm={handleConfirm} onCancel={handleCancel} children={<h1>Hello</h1>}></SidebarLayout>,
  };
};
