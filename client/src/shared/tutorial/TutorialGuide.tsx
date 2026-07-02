import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useTutorial } from "./TutorialContext";
import "./tutorial.scss";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const PADDING = 8;
const DIALOG_GAP = 16;

function TutorialGuide() {
  const { isActive, currentStep, stepIndex, totalSteps, next, prev, skip } = useTutorial();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [dialogStyle, setDialogStyle] = useState<React.CSSProperties>({});

  const updateTargetRect = useCallback(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(`[data-tutorial="${currentStep.target}"]`);
    if (!element) {
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    if (currentStep.id === "menu") {
      if (isMobile) {
        setOpenMobile(true);
      } else {
        setOpen(true);
      }
    }
  }, [currentStep, isActive, isMobile, setOpen, setOpenMobile]);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    let attempts = 0;
    const maxAttempts = 30;

    const tryLocate = () => {
      updateTargetRect();
      attempts += 1;

      if (currentStep.target) {
        const element = document.querySelector(`[data-tutorial="${currentStep.target}"]`);
        if (element) {
          element.scrollIntoView({ block: "nearest", behavior: "smooth" });
          updateTargetRect();
          return;
        }
      }

      if (attempts < maxAttempts) {
        window.setTimeout(tryLocate, 120);
      }
    };

    const timer = window.setTimeout(tryLocate, 80);
    return () => window.clearTimeout(timer);
  }, [currentStep, isActive, updateTargetRect]);

  useLayoutEffect(() => {
    if (!isActive) return;

    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isActive, updateTargetRect]);

  useLayoutEffect(() => {
    if (!isActive || !currentStep) return;

    const placement = currentStep.placement ?? "bottom";
    const dialogWidth = 320;
    const dialogHeight = 200;
    const viewportPadding = 16;

    if (placement === "center" || !targetRect) {
      setDialogStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `min(${dialogWidth}px, calc(100vw - ${viewportPadding * 2}px))`,
      });
      return;
    }

    let top = targetRect.top + targetRect.height + DIALOG_GAP;
    let left = targetRect.left;

    if (placement === "top") {
      top = targetRect.top - dialogHeight - DIALOG_GAP;
    } else if (placement === "left") {
      top = targetRect.top;
      left = targetRect.left - dialogWidth - DIALOG_GAP;
    } else if (placement === "right") {
      top = targetRect.top;
      left = targetRect.left + targetRect.width + DIALOG_GAP;
    } else if (placement === "bottom") {
      top = targetRect.top + targetRect.height + DIALOG_GAP;
      left = targetRect.left;
    }

    const maxLeft = window.innerWidth - dialogWidth - viewportPadding;
    const maxTop = window.innerHeight - dialogHeight - viewportPadding;

    setDialogStyle({
      top: `${Math.max(viewportPadding, Math.min(top, maxTop))}px`,
      left: `${Math.max(viewportPadding, Math.min(left, maxLeft))}px`,
      width: `min(${dialogWidth}px, calc(100vw - ${viewportPadding * 2}px))`,
    });
  }, [currentStep, isActive, targetRect]);

  if (!isActive || !currentStep) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="tutorial-root" role="presentation">
      <div className="tutorial-backdrop" onClick={(event) => event.stopPropagation()} />

      {targetRect ?
        <div
          className="tutorial-spotlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      : null}

      <div
        className={cn("tutorial-dialog", targetRect && "tutorial-dialog--anchored")}
        style={dialogStyle}
        role="dialog"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
        aria-modal="true">
        <p className="tutorial-dialog__step">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 id="tutorial-title" className="tutorial-dialog__title">
          {currentStep.title}
        </h2>
        <p id="tutorial-description" className="tutorial-dialog__description">
          {currentStep.description}
        </p>

        <div className="tutorial-dialog__actions">
          <Button type="button" variant="ghost" size="sm" className="tutorial-dialog__skip" onClick={skip}>
            Skip tour
          </Button>
          <div className="tutorial-dialog__nav">
            <Button type="button" variant="outline" size="sm" onClick={prev} disabled={isFirst}>
              Previous
            </Button>
            <Button type="button" size="sm" onClick={next}>
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialGuide;
