import { usePermissions } from "@/shared/context/PermissionsContext";
import { getUserIdFromToken } from "@/shared/utils/auth-token";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTutorialStepsForPermissions, type TutorialStep } from "./tutorial-steps";
import {
  isTutorialCompleted,
  markTutorialCompleted,
  markTutorialPending,
  shouldStartTutorial,
  TUTORIAL_PENDING_EVENT,
} from "./tutorial-storage";

type TutorialContextValue = {
  isActive: boolean;
  stepIndex: number;
  steps: TutorialStep[];
  currentStep: TutorialStep | null;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
  startTutorial: () => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
}

export function useTutorialOptional(): TutorialContextValue | null {
  return useContext(TutorialContext);
}

export { markTutorialPending };

type TutorialProviderProps = {
  children: React.ReactNode;
};

export function TutorialProvider({ children }: TutorialProviderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { permissions, isInitialized, isLoading } = usePermissions();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasAutoStartedRef = useRef(false);

  const steps = useMemo(() => getTutorialStepsForPermissions(permissions ?? []), [permissions]);

  const currentStep = steps[stepIndex] ?? null;
  const totalSteps = steps.length;

  const finishTutorial = useCallback(() => {
    markTutorialCompleted(getUserIdFromToken());
    setIsActive(false);
    setStepIndex(0);
  }, []);

  const startTutorial = useCallback(() => {
    if (!steps.length) return;
    hasAutoStartedRef.current = true;
    setStepIndex(0);
    setIsActive(true);
    navigate(steps[0].route, { replace: true });
  }, [navigate, steps]);

  const skip = useCallback(() => {
    finishTutorial();
  }, [finishTutorial]);

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      finishTutorial();
      return;
    }

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    navigate(steps[nextIndex].route);
  }, [finishTutorial, navigate, stepIndex, steps]);

  const prev = useCallback(() => {
    if (stepIndex <= 0) return;

    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    navigate(steps[prevIndex].route);
  }, [navigate, stepIndex, steps]);

  const tryAutoStart = useCallback(() => {
    if (!isInitialized || isLoading || isActive || hasAutoStartedRef.current) return;
    if (!shouldStartTutorial()) return;
    if (!steps.length) return;

    hasAutoStartedRef.current = true;
    setStepIndex(0);
    setIsActive(true);
    navigate(steps[0].route, { replace: true });
  }, [isActive, isInitialized, isLoading, navigate, steps]);

  useEffect(() => {
    tryAutoStart();
  }, [tryAutoStart, pathname]);

  useEffect(() => {
    const handlePending = () => tryAutoStart();
    window.addEventListener(TUTORIAL_PENDING_EVENT, handlePending);
    return () => window.removeEventListener(TUTORIAL_PENDING_EVENT, handlePending);
  }, [tryAutoStart]);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const matchesRoute = pathname === currentStep.route || pathname.startsWith(`${currentStep.route}/`);

    if (!matchesRoute) {
      navigate(currentStep.route);
    }
  }, [currentStep, isActive, navigate, pathname]);

  const value = useMemo(
    () => ({
      isActive,
      stepIndex,
      steps,
      currentStep,
      totalSteps,
      next,
      prev,
      skip,
      startTutorial,
    }),
    [currentStep, isActive, next, prev, skip, startTutorial, stepIndex, steps, totalSteps]
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function isTutorialDoneForCurrentUser(): boolean {
  return isTutorialCompleted(getUserIdFromToken());
}
