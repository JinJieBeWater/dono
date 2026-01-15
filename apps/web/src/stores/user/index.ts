import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { storeOptions, useStore } from "@livestore/react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { schema } from "@dono/stores/user";
import { makeUserStoreId } from "@dono/stores/utils";

import LiveStoreWorker from "./worker.ts?worker";
import { getLocalUserInfo } from "@/utils/get-local-user-info";
import { shouldNeverHappen } from "@/utils/should-never-happen";

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

export const userStoreOptions = () => {
  const localUserInfo = getLocalUserInfo();

  if (!localUserInfo) {
    throw shouldNeverHappen("useNovelStore must be used after user has logged in");
  }

  return storeOptions({
    storeId: makeUserStoreId(localUserInfo.id),
    schema,
    adapter,
    batchUpdates,
    unusedCacheTime: Number.POSITIVE_INFINITY,
  });
};

export const useUserStore = () => {
  return useStore(userStoreOptions());
};
