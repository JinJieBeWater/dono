import { LOCAL_USER_INFO_KEY } from "@/constants";
import { IS_SERVER } from "@/lib/utils";
import type { LocalUserInfo } from "@/types";

export function getLocalUserInfo(): LocalUserInfo | null {
  if (IS_SERVER) {
    return null;
  }
  try {
    const raw = localStorage.getItem(LOCAL_USER_INFO_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as LocalUserInfo;
  } catch {
    return null;
  }
}
