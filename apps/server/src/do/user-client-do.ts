import { DurableObject } from "cloudflare:workers";
import { createStoreDoPromise, type ClientDoWithRpcCallback } from "@livestore/adapter-cloudflare";
import { nanoid, type Store, type Unsubscribe } from "@livestore/livestore";
import { schema } from "@dono/stores/user/schema";
import { handleSyncUpdateRpc } from "@livestore/sync-cf/client";
import type { CfTypes } from "@livestore/sync-cf/common";
import { userTables } from "@dono/stores/user";
import { env } from "@dono/env/server";
import { makeNovelStoreIdFromUserStoreId } from "@dono/stores/utils";

export class UserClientDO extends DurableObject<Env> implements ClientDoWithRpcCallback {
  private cachedStore: Store<typeof schema> | undefined;
  private novelChangeSubscription: Unsubscribe | undefined;
  private novelQuery = userTables.novel.select("id");
  private prevNovels: typeof this.novelQuery.ResultType = [];

  private async ensureStore() {
    if (this.cachedStore !== undefined) return this.cachedStore;

    const storeId = await this.ctx.storage.get<string>("current_store_id");
    if (!storeId) {
      // 如果没有 storeId，说明从未初始化过，此时不应处理 syncUpdateRpc
      throw new Error("Store not initialized. Call initialize() first.");
    }

    await this.initialize(storeId);
    return this.cachedStore!;
  }

  async initialize(storeId: string) {
    if (this.cachedStore !== undefined) return;

    await this.ctx.blockConcurrencyWhile(async () => {
      await this.ctx.storage.put("current_store_id", storeId);

      this.cachedStore = await createStoreDoPromise({
        schema,
        storeId,
        clientId: "user-client-do",
        sessionId: nanoid(),
        durableObject: {
          ctx: this.ctx as CfTypes.DurableObjectState,
          env: this.env,
          bindingName: "USER_CLIENT_DO",
        },
        syncBackendStub: this.env.SYNC_BACKEND_DO.getByName(storeId),
        livePull: true,
      });
      await this.subscribeToStore();
    });
  }

  private async subscribeToStore() {
    if (this.novelChangeSubscription) return;
    if (!this.cachedStore) throw new Error("Store not yet initialized");

    this.prevNovels = this.cachedStore.query(this.novelQuery);

    this.novelChangeSubscription = this.cachedStore.subscribe(
      this.novelQuery,
      this.publishNovelChange.bind(this),
    );
  }

  private async publishNovelChange(currentNovels: typeof this.novelQuery.ResultType) {
    const prevSet = new Set(this.prevNovels);
    const currSet = new Set(currentNovels);

    const addedIds: string[] = [];
    for (const id of currSet) {
      if (!prevSet.has(id)) addedIds.push(id);
    }

    const purgedIds: string[] = [];
    for (const id of prevSet) {
      if (!currSet.has(id)) purgedIds.push(id);
    }

    if (addedIds.length) await this.handleNovelsAdded(addedIds);
    if (purgedIds.length) await this.handleNovelsPurged(purgedIds);

    this.prevNovels = currentNovels;
  }

  private async handleNovelsAdded(novelIds: ReadonlyArray<string>) {
    const userStoreId = this.cachedStore?.storeId;
    if (!userStoreId) throw new Error("No user store id");
    const novelStoreIds = novelIds.map((novelId) =>
      makeNovelStoreIdFromUserStoreId(userStoreId, novelId),
    );
    await Promise.all(
      novelStoreIds.map(async (novelStoreId) => {
        const novelSyncDo = env.SYNC_BACKEND_DO.getByName(novelStoreId);
        const res = await novelSyncDo.test();
        console.log(res);
      }),
    );
  }

  private async handleNovelsPurged(novelIds: ReadonlyArray<string>) {
    console.log("novel purged", novelIds);
    const userStoreId = this.cachedStore?.storeId;
    if (!userStoreId) throw new Error("No user store id");
    const novelStoreIds = novelIds.map((novelId) =>
      makeNovelStoreIdFromUserStoreId(userStoreId, novelId),
    );
    await Promise.all(
      novelStoreIds.map(async (novelStoreId) => {
        const novelSyncDo = env.SYNC_BACKEND_DO.getByName(novelStoreId);
        const res = await novelSyncDo.purge();
        console.log(res);
      }),
    );
  }

  async syncUpdateRpc(payload: unknown) {
    try {
      // 1. 确保 Store 已唤醒并重新订阅
      await this.ensureStore();
      await handleSyncUpdateRpc(payload);
    } catch {
      console.warn("[Lifecycle] Skipping syncUpdateRpc: Store not yet initialized by user.");
    }
  }

  // 判断小说是否可以进行同步
  async canNovelBeSynced(storeId: string, novelId: string): Promise<boolean> {
    await this.initialize(storeId);
    if (!this.cachedStore) throw new Error("canNovelBeSynced: Store not yet initialized");
    const novel = this.cachedStore.query(
      userTables.novel.select("id").where({ id: novelId, deleted: null }).first(),
    );

    return Boolean(novel);
  }
}
