import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, value: T) {
  const [state, setState] = useState(() => {
    const persistedValue = sessionStorage.getItem(key);
    return persistedValue ? (JSON.parse(persistedValue) as T) : value;
  });
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [state]);
  return { state, setState } as const;
}
