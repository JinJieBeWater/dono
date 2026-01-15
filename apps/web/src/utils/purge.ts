import type { StoreRegistry } from "@livestore/livestore";

import { getNovelStoreId, novelStoreOptions } from "@/stores/novel";
import { hasLiveStoreData, purgeLiveStoreOpfsByStoreId } from "@/utils/livestore-opfs";
import { purgeYjsRoomsByPrefix } from "@/components/editor/extension/yjs";
import { getLocalUserInfo } from "@/utils/get-local-user-info";
import { makeChapterRoomPrefix } from "@dono/stores/utils";

/** 等待 store 完全关闭后再清理数据 */
const SHUTDOWN_DELAY_MS = 100;

interface PurgeNovelParams {
  storeRegistry: StoreRegistry;
  novelId: string;
}

export async function purgeNovelLocalData(params: PurgeNovelParams): Promise<void> {
  const { storeRegistry, novelId } = params;
  const localUserInfo = getLocalUserInfo();
  if (!localUserInfo) return;

  const storeId = getNovelStoreId(novelId);
  const hasData = await hasLiveStoreData(storeId);

  if (hasData) {
    const storeOrPromise = storeRegistry.getOrLoadPromise(novelStoreOptions(novelId));
    const novelStore = await Promise.resolve(storeOrPromise);
    await novelStore.shutdownPromise();
    await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_DELAY_MS));
    await purgeLiveStoreOpfsByStoreId(storeId);
  }

  const yjsRoomPrefix = makeChapterRoomPrefix(localUserInfo.id, novelId);
  await purgeYjsRoomsByPrefix(yjsRoomPrefix);
}
