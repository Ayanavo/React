import { cn } from "@/lib/utils";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import React, { cloneElement, isValidElement, ReactElement, RefObject, useImperativeHandle, useState } from "react";
import { ColorPickerPanel, ColorPickerPanelProps } from "./color-picker-panel";

export type ColorPickerPopoverHandle = {
  open: () => void;
  close: () => void;
};

export type ColorPickerPopoverProps = ColorPickerPanelProps & {
  trigger?: ReactElement;
  controlRef?: RefObject<ColorPickerPopoverHandle | null>;
  anchorRef?: RefObject<HTMLElement | null>;
  className?: string;
};

export function ColorPickerPopover({
  color,
  onChange,
  onChangeComplete,
  trigger,
  controlRef,
  anchorRef,
  className,
}: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: "fixed",
    placement: "bottom-start",
    middleware: [
      offset(6),
      flip({
        fallbackPlacements: ["top-start", "bottom-end", "top-end", "right-start", "left-start"],
        padding: 12,
      }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: !anchorRef });
  const dismiss = useDismiss(context, {
    outsidePress: (event) => {
      const target = event.target as HTMLElement | null;
      // Select (and similar) menus portal outside the picker; ignore those presses.
      if (target?.closest?.("[data-color-picker-select], [data-radix-select-viewport], [role='listbox']")) {
        return false;
      }
      return true;
    },
  });
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  useImperativeHandle(controlRef, () => ({
    open: () => {
      if (anchorRef?.current) {
        refs.setReference(anchorRef.current);
      }
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  }));

  const triggerNode = isValidElement(trigger) ? trigger : null;
  const triggerRef =
    triggerNode ?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (triggerNode as any).ref
    : undefined;
  const referenceRef = useMergeRefs([refs.setReference, triggerRef]);

  return (
    <>
      {triggerNode ?
        cloneElement(
          triggerNode,
          getReferenceProps({
            ref: referenceRef,
            ...(triggerNode.props as object),
          })
        )
      : null}

      {isOpen ?
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} closeOnFocusOut={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={cn("color-picker-popover z-50 outline-none", className)}
              onMouseDown={(event) => event.stopPropagation()}>
              <ColorPickerPanel color={color} onChange={onChange} onChangeComplete={onChangeComplete} />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      : null}
    </>
  );
}
