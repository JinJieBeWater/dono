import { LOCAL_USER_INFO_KEY } from "@/constants";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LocalUserInfo } from "@/types";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type LocalUserContextValue = {
  localUserInfo: LocalUserInfo | null;
  setLocalUserInfo: Dispatch<SetStateAction<LocalUserInfo | null>>;
  clearLocalUserInfo: () => void;
};

export const LocalUserInfoContext = createContext<LocalUserContextValue | undefined>(undefined);

export function LocalUserInfoProvider({ children }: { children: ReactNode }) {
  const [localUserInfo, setLocalUserInfo] = useLocalStorage<LocalUserInfo | null>(
    LOCAL_USER_INFO_KEY,
    null,
  );

  const clearLocalUserInfo = useCallback(() => {
    setLocalUserInfo(null);
  }, [setLocalUserInfo]);

  const value = useMemo<LocalUserContextValue>(
    () => ({
      localUserInfo,
      setLocalUserInfo,
      clearLocalUserInfo,
    }),
    [localUserInfo, setLocalUserInfo, clearLocalUserInfo],
  );

  return <LocalUserInfoContext.Provider value={value}>{children}</LocalUserInfoContext.Provider>;
}

export function useLocalUserInfo() {
  const context = useContext(LocalUserInfoContext);
  if (!context) {
    throw new Error("useLocalUserInfo must be used within LocalUserInfoProvider");
  }
  return context;
}
