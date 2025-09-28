import showToast from "@/hooks/toast";
import { ReactElement, useRef } from "react";
import { useIdleTimer } from "react-idle-timer";

function IdleTimerWrapper({ children }: { children: ReactElement }) {
  const timeoutSeconds = 1 * 60; // total idle timeout
  const promptSeconds = 10; // warn before idle timeout

  const promptShown = useRef(false);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const remaining = useRef(promptSeconds);

  const clearCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  };

  const { reset } = useIdleTimer({
    timeout: timeoutSeconds * 1000,
    promptBeforeIdle: promptSeconds * 1000,

    onPrompt: () => {
      if (promptShown.current) return;
      promptShown.current = true;
      remaining.current = promptSeconds;

      showToast({
        title: `You will be logged out in ${remaining.current} seconds due to inactivity.`,
        variant: "warning",
      });

      clearCountdown();
      countdownTimer.current = setInterval(() => {
        remaining.current -= 1;

        if (remaining.current > 0) {
          showToast({
            title: `You will be logged out in ${remaining.current} seconds due to inactivity.`,
            variant: "warning",
          });
        } else {
          clearCountdown();
        }
      }, 1000);
    },

    onIdle: () => {
      clearCountdown();
      promptShown.current = false;
      remaining.current = promptSeconds;

      showToast({
        title: "You have been logged out due to inactivity.",
        variant: "error",
      });
    },

    onActive: () => {
      clearCountdown();
      promptShown.current = false;
      remaining.current = promptSeconds;
      reset();
    },

    onAction: () => {
      if (promptShown.current) {
        clearCountdown();
        promptShown.current = false;
        remaining.current = promptSeconds;
        reset();
      }
    },

    debounce: 500,
  });

  return children;
}

export default IdleTimerWrapper;
