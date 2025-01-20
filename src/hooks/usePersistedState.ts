import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, value: T) {
  const [state, setState] = useState(() => {
    const persistedValue = localStorage.getItem(key);
    return persistedValue ? (JSON.parse(persistedValue) as T) : value;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);
  return { state, setState } as const;
}
