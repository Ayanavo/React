import moment from "moment";
import { connectSocket, USER_LOGIN_STATUS_EVENT, type UserLoginStatusPayload } from "@/shared/services/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type UseUserLoginStatusSocketOptions = {
  queryKey: string;
  enabled?: boolean;
};

export type UserLoginTrackable = {
  _id: string;
  isLoggedIn?: boolean;
  lastLoginAt?: string | null;
  lastLogoutAt?: string | null;
  totalTimeSpentMs?: number;
  currentSessionStartedAt?: string | null;
};

export const useUserLoginStatusSocket = <T extends UserLoginTrackable>({
  queryKey,
  enabled = true,
}: UseUserLoginStatusSocketOptions): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSocket();

    const onLoginStatus = (payload: UserLoginStatusPayload) => {
      const { userId, isLoggedIn, lastLoginAt, lastLogoutAt, totalTimeSpentMs, currentSessionStartedAt } = payload;

      queryClient.setQueryData<T[]>([queryKey], (users) =>
        users?.map((user) =>
          user._id === userId
            ? {
                ...user,
                isLoggedIn,
                ...(lastLoginAt !== undefined ? { lastLoginAt } : isLoggedIn ? { lastLoginAt: moment().toISOString() } : {}),
                ...(lastLogoutAt !== undefined ? { lastLogoutAt } : {}),
                ...(totalTimeSpentMs !== undefined ? { totalTimeSpentMs } : {}),
                ...(currentSessionStartedAt !== undefined ? { currentSessionStartedAt } : {}),
              }
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
