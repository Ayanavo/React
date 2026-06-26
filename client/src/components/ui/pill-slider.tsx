import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import * as React from "react";

type PillSliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  showTicks?: boolean;
  valueDisplay?: string;
};

const PillSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, PillSliderProps>(
  ({ className, min = 0, max = 100, step = 1, showTicks, value, valueDisplay, ...props }, ref) => {
    const minVal = Number(min);
    const maxVal = Number(max);
    const stepVal = Number(step) || 1;
    const tickCount = Math.max(2, Math.floor((maxVal - minVal) / stepVal) + 1);
    const shouldShowTicks = showTicks ?? (stepVal >= 1 && tickCount <= 12);
    const dotCount = shouldShowTicks ? (tickCount <= 12 ? tickCount : 8) : 0;
    const activeValue = value?.[0] ?? minVal;
    const isAtMin = activeValue <= minVal;

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        className={cn("relative flex h-full min-h-0 w-full touch-none select-none items-center", className)}
        {...props}>
        {dotCount > 0 && (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 z-[3] flex items-center justify-between",
              valueDisplay ? "left-1 right-7" : "inset-x-1"
            )}
            aria-hidden="true">
            {Array.from({ length: dotCount }).map((_, index) => (
              <span key={index} className="size-[3px] rounded-full bg-foreground/25" />
            ))}
          </div>
        )}

        <SliderPrimitive.Track className="relative z-[1] h-full w-full grow overflow-hidden rounded-md bg-foreground/[0.08]">
          <SliderPrimitive.Range className="absolute h-full rounded-md bg-foreground/[0.18]" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="relative z-[4] flex h-3.5 w-[4px] items-center justify-center border-0 bg-transparent p-0 shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50">
          <span
            className={cn(
              "h-3.5 w-[4px] rounded-sm bg-foreground/40 transition-transform",
              isAtMin ? "translate-x-0" : "-translate-x-1.5"
            )}
            aria-hidden="true"
          />
        </SliderPrimitive.Thumb>

        {valueDisplay ? (
          <span
            className="pointer-events-none absolute inset-y-0 right-2 z-[5] flex items-center text-xs font-medium tabular-nums text-muted-foreground"
            aria-hidden="true">
            {valueDisplay}
          </span>
        ) : null}
      </SliderPrimitive.Root>
    );
  }
);

PillSlider.displayName = "PillSlider";

export { PillSlider };
