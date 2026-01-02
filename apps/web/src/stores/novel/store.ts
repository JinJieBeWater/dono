import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { useStore } from "@livestore/react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { schema } from ".";
import LiveStoreWorker from "./worker.ts?worker";
import { getLocalUserInfo } from "@/utils/get-local-user-info";

const hasWindow = typeof window !== "undefined";
const resetPersistence =
  hasWindow &&
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("reset") !== null;

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
  resetPersistence,
});

export const novelStoreOptions = (novelId: string) => {
  const localUserInfo = getLocalUserInfo();

  if (!localUserInfo) {
    throw new Error("useNovelStore must be used after user has logged in");
  }

  return {
    storeId: `user-${localUserInfo.id}-novel-${novelId}`,
    schema,
    adapter,
    batchUpdates,
  };
};

export const useNovelStore = (novelId: string) => {
  return useStore(novelStoreOptions(novelId));
};
