import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { fetchPermissionsByToken } from "@/shared/services/masterAccess";
import { AUTH_CHANGED_EVENT, getAuthToken, isAuthenticated } from "@/shared/utils/auth-token";

type PermissionsContextType = {
  permissions: string[];
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  refetchPermissions: () => Promise<void>;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetchPermissions = useCallback(async () => {
    if (!isAuthenticated()) {
      setPermissions([]);
      setError(null);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchPermissionsByToken();
      setPermissions(result || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch permissions"));
      setPermissions([]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    void refetchPermissions();

    const handleAuthChange = () => {
      void refetchPermissions();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
  }, [refetchPermissions]);

  return (
    <PermissionsContext.Provider
      value={{ permissions, isLoading, isInitialized, error, refetchPermissions }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
};

export const useHasAuthToken = (): boolean => {
  const [hasToken, setHasToken] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    const sync = () => setHasToken(Boolean(getAuthToken()));
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  return hasToken;
};
