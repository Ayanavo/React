import { getUserIdFromToken } from "@/shared/utils/auth-token";

const PENDING_KEY = "tutorial:pending";

export const TUTORIAL_PENDING_EVENT = "tutorial-pending";

const completedKey = (userId: string) => `tutorial:completed:${userId}`;

export function markTutorialPending(): void {
  sessionStorage.setItem(PENDING_KEY, "true");
  window.dispatchEvent(new Event(TUTORIAL_PENDING_EVENT));
}

export function isTutorialPending(): boolean {
  return sessionStorage.getItem(PENDING_KEY) === "true";
}

export function clearTutorialPending(): void {
  sessionStorage.removeItem(PENDING_KEY);
}

export function isTutorialCompleted(userId?: string | null): boolean {
  const id = userId ?? getUserIdFromToken();
  if (!id) return false;
  return localStorage.getItem(completedKey(id)) === "true";
}

export function markTutorialCompleted(userId?: string | null): void {
  const id = userId ?? getUserIdFromToken();
  if (!id) return;
  localStorage.setItem(completedKey(id), "true");
  clearTutorialPending();
}

export function shouldStartTutorial(userId?: string | null): boolean {
  if (!isTutorialPending()) return false;

  const id = userId ?? getUserIdFromToken();
  if (id && isTutorialCompleted(id)) {
    clearTutorialPending();
    return false;
  }

  return true;
}
