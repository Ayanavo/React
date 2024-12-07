import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import * as React from "react";
import { ReactNode, RefObject, useImperativeHandle, useState } from "react";

interface CustomPopoverProps {
  content: ReactNode;
  className?: string;
  controlRef?: RefObject<{ open: () => void; close: () => void }>;
}

export function CustomPopover({ content, className, controlRef }: CustomPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: "absolute",
    placement: "bottom",
    transform: false,
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, {
      enabled: false,
    }),
    useDismiss(context, { enabled: false }),
    useRole(context),
  ]);

  useImperativeHandle(controlRef, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div ref={refs.setReference} {...getReferenceProps()}></div>
      </PopoverTrigger>
      {isOpen && (
        <FloatingPortal>
          {isOpen && (
            <FloatingFocusManager context={context} modal={false}>
              <PopoverContent
                onInteractOutside={(e) => e.stopPropagation()}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className={cn(className)}
                onClick={(e) => e.stopPropagation()}>
                {content}
              </PopoverContent>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      )}
    </Popover>
  );
}
