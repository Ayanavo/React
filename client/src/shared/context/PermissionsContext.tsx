import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchPermissionsByToken } from "@/shared/services/masterAccess";

type PermissionsContextType = {
  permissions: string[];
  isLoading: boolean;
  error: Error | null;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    <PermissionsContext.Provider value={{ permissions, isLoading, error }}>
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
