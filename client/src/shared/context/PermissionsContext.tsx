import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { fetchPermissionsByToken } from "@/shared/services/masterAccess";

type PermissionsContextType = {
  permissions: string[];
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  refetchPermissions: () => Promise<void>;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const auth_token = sessionStorage.getItem("auth_token");
    const refetchPermissions = useCallback(async () => {
    if (!auth_token) {
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
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        const result = await fetchPermissionsByToken();
        setPermissions(result || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch permissions"));
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, isInitialized, isLoading, error,  refetchPermissions }}>
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
