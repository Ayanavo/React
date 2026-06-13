import { connectSocket, USER_LOGIN_STATUS_EVENT } from "@/shared/services/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type UserLoginStatusPayload = {
  userId: string;
  isLoggedIn: boolean;
};

type UseUserLoginStatusSocketOptions = {
  queryKey: string;
  enabled?: boolean;
};

export const useUserLoginStatusSocket = <T extends { _id: string; isLoggedIn?: boolean; lastLoginAt?: string | null }>({
  queryKey,
  enabled = true,
}: UseUserLoginStatusSocketOptions): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSocket();

    const onLoginStatus = ({ userId, isLoggedIn }: UserLoginStatusPayload) => {
      queryClient.setQueryData<T[]>([queryKey], (users) =>
        users?.map((user) =>
          user._id === userId ?
            { ...user, isLoggedIn, ...(isLoggedIn ? { lastLoginAt: new Date().toISOString() } : {}) }
          : user
        )
      );
    };

    socket.on(USER_LOGIN_STATUS_EVENT, onLoginStatus);

    return () => {
      socket.off(USER_LOGIN_STATUS_EVENT, onLoginStatus);
    };
  }, [enabled, queryClient, queryKey]);
};
